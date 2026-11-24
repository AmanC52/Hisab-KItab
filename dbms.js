/**
 * ============================================================================
 * HISAB KITAB - DATABASE MANAGEMENT SYSTEM (DBMS) ENGINE
 * File: dbms.js
 * Version: 2.0.0
 * 
 * A robust, offline, ACID-inspired Database Management System for local
 * customer ledgers, transaction records, audit logs, and settings.
 * ============================================================================
 */

(function (global) {
  'use strict';

  // Constants
  const DB_NAME = 'hisab_kitab_dbms';
  const DB_VERSION = '2.0.0';
  const STORAGE_KEY = 'hisab_kitab_dbms_storage_v2';
  const LEGACY_STORAGE_KEY = 'hisab_kitab_ledger_data_v1';

  /**
   * Database Schema Definition
   */
  const DEFAULT_SCHEMA = {
    metadata: {
      dbName: DB_NAME,
      version: DB_VERSION,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
      totalCustomers: 0,
      totalTransactions: 0
    },
    tables: {
      customers: [],     // Primary key: id
      transactions: [],  // Primary key: id, Foreign key: customerId
      audit_logs: [],    // Append-only audit history
      settings: {
        theme: 'light',
        currency: 'INR',
        currencySymbol: '₹',
        accounting: {
          creditSign: 1,      // Credit (Mujhe mile) increases what I owe them
          debitSign: -1,      // Debit (Unhone liye) decreases what I owe them
          positiveIsOwe: true // Balance > 0 means I owe them (Green)
        },
        autoBackupIntervalDays: 7,
        lastBackupDate: null
      }
    }
  };

  /**
   * Helper: Generate unique ID
   */
  function generateUUID() {
    return 'hk_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
  }

  /**
   * DBMS Core Class
   */
  class HisabKitabDBMS {
    constructor() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
      this.isInitialized = false;
      this.listeners = [];
    }

    /**
     * Subscribe to database state changes
     */
    onChange(callback) {
      if (typeof callback === 'function') {
        this.listeners.push(callback);
      }
    }

    notifyChange(event, details) {
      this.data.metadata.lastModified = new Date().toISOString();
      this.data.metadata.totalCustomers = this.data.tables.customers.length;
      this.data.metadata.totalTransactions = this.data.tables.transactions.length;
      this.saveToDisk();

      this.listeners.forEach(fn => {
        try {
          fn({ event, details, timestamp: new Date().toISOString() });
        } catch (e) {
          console.error('[DBMS Listener Error]', e);
        }
      });
    }

    /**
     * Initialize Database from Storage or Seed Data
     */
    init() {
      try {
        let raw = null;
        if (typeof localStorage !== 'undefined') {
          raw = localStorage.getItem(STORAGE_KEY);
        }

        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.tables && Array.isArray(parsed.tables.customers)) {
            this.data = parsed;
            this.isInitialized = true;
            this.logAudit('DB_INIT', 'Loaded existing DBMS data from storage');
            return true;
          }
        }

        // Check for legacy v1 data migration
        if (typeof localStorage !== 'undefined') {
          const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY);
          if (legacyRaw) {
            const legacyParsed = JSON.parse(legacyRaw);
            if (legacyParsed && Array.isArray(legacyParsed.customers) && legacyParsed.customers.length > 0) {
              this.migrateFromV1(legacyParsed.customers);
              this.isInitialized = true;
              this.logAudit('DB_MIGRATE', 'Migrated v1 ledger data to v2 DBMS schema');
              return true;
            }
          }
        }

        // Seed with sample data on fresh installation
        this.seedSampleData();
        this.isInitialized = true;
        this.logAudit('DB_SEED', 'Fresh database initialized with sample customer records');
        return true;
      } catch (err) {
        console.error('[DBMS Init Error]', err);
        this.seedSampleData();
        this.isInitialized = true;
        return false;
      }
    }

    /**
     * Persist Database to Local Storage & File System (if desktop environment available)
     */
    saveToDisk() {
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        }

        // If running in Windows Desktop WebView2 / C# Host environment, notify host to auto-save file
        if (typeof window !== 'undefined' && window.chrome && window.chrome.webview) {
          window.chrome.webview.postMessage({
            action: 'SAVE_DBMS_FILE',
            payload: JSON.stringify(this.data, null, 2)
          });
        }
      } catch (e) {
        console.error('[DBMS Save Error]', e);
      }
    }

    /**
     * Migrate from v1 nested structure to v2 normalized relational schema
     */
    migrateFromV1(customersV1) {
      this.data = JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
      customersV1.forEach(c => {
        const custId = c.id || generateUUID();
        this.data.tables.customers.push({
          id: custId,
          name: c.name || 'Unnamed',
          phone: c.phone || '',
          note: c.note || '',
          openingBalance: Number(c.openingBalance) || 0,
          openingBalanceType: c.openingBalanceType || 'credit',
          createdAt: c.createdAt || Date.now(),
          updatedAt: Date.now()
        });

        if (Array.isArray(c.transactions)) {
          c.transactions.forEach(t => {
            this.data.tables.transactions.push({
              id: t.id || generateUUID(),
              customerId: custId,
              type: t.type || 'credit',
              amount: Number(t.amount) || 0,
              date: t.date || new Date().toISOString().split('T')[0],
              desc: t.desc || '',
              paymentMode: t.paymentMode || 'Cash',
              createdAt: t.createdAt || Date.now(),
              updatedAt: Date.now()
            });
          });
        }
      });
      this.saveToDisk();
    }

    /**
     * Seed realistic sample records
     */
    seedSampleData() {
      this.data = JSON.parse(JSON.stringify(DEFAULT_SCHEMA));
      const today = new Date().toISOString().split('T')[0];
      const past1 = new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0];
      const past2 = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
      const past3 = new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0];

      const c1Id = 'cust_brother';
      const c2Id = 'cust_ramesh';
      const c3Id = 'cust_pooja';

      this.data.tables.customers = [
        {
          id: c1Id,
          name: 'Bhai (Brother)',
          phone: '9876543210',
          note: 'Opening credit ₹50k, he takes cash when needed',
          openingBalance: 50000,
          openingBalanceType: 'credit',
          createdAt: Date.now() - 10 * 86400000,
          updatedAt: Date.now()
        },
        {
          id: c2Id,
          name: 'Ramesh Kirana Store',
          phone: '9812345678',
          note: 'Ghar ka ration saman',
          openingBalance: 5000,
          openingBalanceType: 'debit',
          createdAt: Date.now() - 15 * 86400000,
          updatedAt: Date.now()
        },
        {
          id: c3Id,
          name: 'Pooja Sharma',
          phone: '9988776655',
          note: 'Tailoring & clothes order',
          openingBalance: 0,
          openingBalanceType: 'credit',
          createdAt: Date.now() - 2 * 86400000,
          updatedAt: Date.now()
        }
      ];

      this.data.tables.transactions = [
        { id: 'tx_b1', customerId: c1Id, type: 'debit', amount: 50, date: past1, desc: 'Chai aur nashta', paymentMode: 'Cash', createdAt: 1 },
        { id: 'tx_b2', customerId: c1Id, type: 'debit', amount: 1000, date: past2, desc: 'Bike repair & service', paymentMode: 'UPI', createdAt: 2 },
        { id: 'tx_b3', customerId: c1Id, type: 'debit', amount: 2000, date: past3, desc: 'Grocery & petrol', paymentMode: 'Cash', createdAt: 3 },
        { id: 'tx_b4', customerId: c1Id, type: 'debit', amount: 1500, date: today, desc: 'Mobile recharge & shopping', paymentMode: 'Online', createdAt: 4 },
        
        { id: 'tx_r1', customerId: c2Id, type: 'credit', amount: 3000, date: past2, desc: 'Cash jama kiya', paymentMode: 'Cash', createdAt: 5 },
        { id: 'tx_r2', customerId: c2Id, type: 'debit', amount: 1200, date: today, desc: 'Atta, tel & masale', paymentMode: 'Udhar', createdAt: 6 },

        { id: 'tx_p1', customerId: c3Id, type: 'credit', amount: 10000, date: past1, desc: 'Advance payment mila', paymentMode: 'Bank Transfer', createdAt: 7 },
        { id: 'tx_p2', customerId: c3Id, type: 'debit', amount: 10000, date: today, desc: 'Saman deliver kiya (Hisab Barabar)', paymentMode: 'Cash', createdAt: 8 }
      ];

      this.saveToDisk();
    }

    /**
     * Clear sample data & start clean
     */
    clearAllData() {
      this.data.tables.customers = [];
      this.data.tables.transactions = [];
      this.logAudit('DB_CLEAR', 'Cleared all customer records and transactions');
      this.notifyChange('CLEAR_ALL', null);
    }

    /**
     * Audit Log Appender
     */
    logAudit(action, details) {
      if (!Array.isArray(this.data.tables.audit_logs)) {
        this.data.tables.audit_logs = [];
      }
      this.data.tables.audit_logs.unshift({
        id: generateUUID(),
        action: action,
        details: typeof details === 'object' ? JSON.stringify(details) : String(details),
        timestamp: new Date().toISOString()
      });
      // Keep last 250 audit logs
      if (this.data.tables.audit_logs.length > 250) {
        this.data.tables.audit_logs.pop();
      }
    }

    // =========================================================================
    // CUSTOMER CRUD OPERATIONS
    // =========================================================================

    getAllCustomers() {
      return this.data.tables.customers.map(c => this.getCustomerDetails(c.id));
    }

    getCustomerById(id) {
      return this.data.tables.customers.find(c => c.id === id) || null;
    }

    insertCustomer(customerData) {
      if (!customerData.name || !customerData.name.trim()) {
        throw new Error('Customer name is required');
      }

      const newCustomer = {
        id: generateUUID(),
        name: customerData.name.trim(),
        phone: (customerData.phone || '').trim(),
        note: (customerData.note || '').trim(),
        openingBalance: Math.max(0, parseFloat(customerData.openingBalance) || 0),
        openingBalanceType: customerData.openingBalanceType === 'debit' ? 'debit' : 'credit',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.data.tables.customers.unshift(newCustomer);
      this.logAudit('CUSTOMER_CREATE', `Created customer: ${newCustomer.name} (ID: ${newCustomer.id})`);
      this.notifyChange('CUSTOMER_CREATED', newCustomer);
      return newCustomer;
    }

    updateCustomer(id, updateData) {
      const customer = this.getCustomerById(id);
      if (!customer) {
        throw new Error('Customer not found');
      }

      if (updateData.name && updateData.name.trim()) {
        customer.name = updateData.name.trim();
      }
      if (updateData.phone !== undefined) {
        customer.phone = updateData.phone.trim();
      }
      if (updateData.note !== undefined) {
        customer.note = updateData.note.trim();
      }
      if (updateData.openingBalance !== undefined) {
        customer.openingBalance = Math.max(0, parseFloat(updateData.openingBalance) || 0);
      }
      if (updateData.openingBalanceType !== undefined) {
        customer.openingBalanceType = updateData.openingBalanceType === 'debit' ? 'debit' : 'credit';
      }
      customer.updatedAt = Date.now();

      this.logAudit('CUSTOMER_UPDATE', `Updated customer: ${customer.name}`);
      this.notifyChange('CUSTOMER_UPDATED', customer);
      return customer;
    }

    deleteCustomer(id) {
      const customer = this.getCustomerById(id);
      if (!customer) return false;

      // Delete cascade all transactions
      const txCountBefore = this.data.tables.transactions.length;
      this.data.tables.transactions = this.data.tables.transactions.filter(t => t.customerId !== id);
      const deletedTxCount = txCountBefore - this.data.tables.transactions.length;

      // Delete customer
      this.data.tables.customers = this.data.tables.customers.filter(c => c.id !== id);

      this.logAudit('CUSTOMER_DELETE', `Deleted customer ${customer.name} and ${deletedTxCount} associated transactions`);
      this.notifyChange('CUSTOMER_DELETED', { customerId: id, name: customer.name });
      return true;
    }

    // =========================================================================
    // TRANSACTION CRUD & ACCOUNTING CALCULATIONS
    // =========================================================================

    getCustomerTransactions(customerId) {
      const list = this.data.tables.transactions.filter(t => t.customerId === customerId);
      // Chronological sort: by date, then createdAt
      list.sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return (a.createdAt || 0) - (b.createdAt || 0);
      });
      return list;
    }

    getCustomerDetails(customerId) {
      const customer = this.getCustomerById(customerId);
      if (!customer) return null;

      const opAmount = Number(customer.openingBalance) || 0;
      const opType = customer.openingBalanceType || 'credit';
      const opContribution = (opType === 'credit' ? 1 : -1) * opAmount;

      const transactions = this.getCustomerTransactions(customerId);
      let totalCredit = 0;
      let totalDebit = 0;
      let running = opContribution;

      const processedTransactions = transactions.map((t, index) => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'credit') {
          totalCredit += amt;
          running += amt;
        } else {
          totalDebit += amt;
          running -= amt;
        }

        return {
          ...t,
          serialNo: index + 1,
          runningBalance: running
        };
      });

      const netBalance = opContribution + totalCredit - totalDebit;

      return {
        ...customer,
        openingContribution: opContribution,
        totalCredit,
        totalDebit,
        netBalance,
        transactionsCount: processedTransactions.length,
        processedTransactions
      };
    }

    insertTransaction(customerId, txData) {
      const customer = this.getCustomerById(customerId);
      if (!customer) {
        throw new Error('Customer not found for transaction');
      }

      const amount = parseFloat(txData.amount);
      if (!amount || amount <= 0) {
        throw new Error('Amount must be greater than zero');
      }

      const newTx = {
        id: generateUUID(),
        customerId: customerId,
        type: txData.type === 'debit' ? 'debit' : 'credit',
        amount: amount,
        date: txData.date || new Date().toISOString().split('T')[0],
        desc: (txData.desc || '').trim(),
        paymentMode: txData.paymentMode || 'Cash',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.data.tables.transactions.push(newTx);
      this.logAudit('TRANSACTION_CREATE', `Added ${newTx.type} ₹${amount} for ${customer.name}`);
      this.notifyChange('TRANSACTION_CREATED', newTx);
      return newTx;
    }

    updateTransaction(txId, updateData) {
      const tx = this.data.tables.transactions.find(t => t.id === txId);
      if (!tx) {
        throw new Error('Transaction not found');
      }

      if (updateData.type) {
        tx.type = updateData.type === 'debit' ? 'debit' : 'credit';
      }
      if (updateData.amount !== undefined) {
        const amt = parseFloat(updateData.amount);
        if (amt > 0) tx.amount = amt;
      }
      if (updateData.date) {
        tx.date = updateData.date;
      }
      if (updateData.desc !== undefined) {
        tx.desc = updateData.desc.trim();
      }
      if (updateData.paymentMode) {
        tx.paymentMode = updateData.paymentMode;
      }
      tx.updatedAt = Date.now();

      this.logAudit('TRANSACTION_UPDATE', `Updated transaction #${tx.id} (₹${tx.amount})`);
      this.notifyChange('TRANSACTION_UPDATED', tx);
      return tx;
    }

    deleteTransaction(txId) {
      const txIndex = this.data.tables.transactions.findIndex(t => t.id === txId);
      if (txIndex === -1) return false;

      const deleted = this.data.tables.transactions.splice(txIndex, 1)[0];
      this.logAudit('TRANSACTION_DELETE', `Deleted transaction #${deleted.id} (₹${deleted.amount})`);
      this.notifyChange('TRANSACTION_DELETED', deleted);
      return true;
    }

    /**
     * 1-Click Settle / Hisab Chukta
     * Generates exact offsetting transaction to bring net balance to ₹0
     */
    settleCustomerAccount(customerId, paymentMode = 'Cash', note = 'Hisab Chukta (Settlement)') {
      const details = this.getCustomerDetails(customerId);
      if (!details) return null;

      if (details.netBalance === 0) {
        throw new Error('Hisab pehle se hi barabar hai (Balance is already 0)');
      }

      // If netBalance > 0 (I owe them), we must record DEBIT to return their money
      // If netBalance < 0 (They owe me), we must record CREDIT to record payment received
      const txType = details.netBalance > 0 ? 'debit' : 'credit';
      const settleAmount = Math.abs(details.netBalance);

      return this.insertTransaction(customerId, {
        type: txType,
        amount: settleAmount,
        date: new Date().toISOString().split('T')[0],
        desc: note,
        paymentMode: paymentMode
      });
    }

    // =========================================================================
    // OVERALL DASHBOARD & AGGREGATE STATISTICS
    // =========================================================================

    getDashboardSummary() {
      let totalIOwe = 0;       // Green balance sum
      let totalTheyOwe = 0;    // Red balance sum
      let totalTransactions = this.data.tables.transactions.length;
      let totalCustomers = this.data.tables.customers.length;

      const customerSummaries = this.getAllCustomers();

      customerSummaries.forEach(c => {
        if (c.netBalance > 0) {
          totalIOwe += c.netBalance;
        } else if (c.netBalance < 0) {
          totalTheyOwe += Math.abs(c.netBalance);
        }
      });

      const netDifference = totalIOwe - totalTheyOwe;

      return {
        totalCustomers,
        totalTransactions,
        totalIOwe,
        totalTheyOwe,
        netDifference,
        customerSummaries
      };
    }

    // =========================================================================
    // DBMS IMPORT & EXPORT (.JSON DATABASE FILE)
    // =========================================================================

    exportDatabase() {
      this.data.metadata.lastModified = new Date().toISOString();
      this.data.metadata.totalCustomers = this.data.tables.customers.length;
      this.data.metadata.totalTransactions = this.data.tables.transactions.length;
      return JSON.stringify(this.data, null, 2);
    }

    importDatabase(jsonString, mode = 'replace') {
      try {
        const imported = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
        
        if (!imported || !imported.tables || !Array.isArray(imported.tables.customers)) {
          throw new Error('Invalid DBMS format: tables.customers array missing');
        }

        if (mode === 'replace') {
          this.data = imported;
        } else if (mode === 'merge') {
          // Merge customers
          const existingCustMap = new Map(this.data.tables.customers.map(c => [c.id, c]));
          imported.tables.customers.forEach(newC => {
            if (!existingCustMap.has(newC.id)) {
              this.data.tables.customers.push(newC);
            }
          });

          // Merge transactions
          const existingTxMap = new Map(this.data.tables.transactions.map(t => [t.id, t]));
          if (Array.isArray(imported.tables.transactions)) {
            imported.tables.transactions.forEach(newT => {
              if (!existingTxMap.has(newT.id)) {
                this.data.tables.transactions.push(newT);
              }
            });
          }
        }

        this.logAudit('DB_IMPORT', `Database imported successfully (${mode} mode)`);
        this.notifyChange('DB_IMPORTED', { mode });
        return { success: true, count: this.data.tables.customers.length };
      } catch (err) {
        console.error('[DBMS Import Error]', err);
        return { success: false, error: err.message };
      }
    }
  }

  // Export as Singleton instance
  const dbmsInstance = new HisabKitabDBMS();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = dbmsInstance;
  } else {
    global.DBMS = dbmsInstance;
  }

})(typeof window !== 'undefined' ? window : globalThis);
