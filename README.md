# 📒 Hisab Kitab (हिसाब किताब) - Offline Daily Ledger

<p align="center">
  <a href="https://github.com/AmanC52/Hisab-KItab/releases/download/v1.0.0/Hisab-Kitab.apk">
    <img src="https://img.shields.io/badge/📲_Direct_Download-Hisab--Kitab.apk-brightgreen?style=for-the-badge&logo=android" alt="Download Android APK" height="50">
  </a>
</p>

### 📥 [यहाँ क्लिक करके सीधे APK डाउनलोड करें (Direct Download APK)](https://github.com/AmanC52/Hisab-KItab/releases/download/v1.0.0/Hisab-Kitab.apk)

> **📱 मोबाइल में इनस्टॉल कैसे करें:**
> 1. ऊपर दिए गए **हरे रंग के बटन** या **Direct Download लिंक** पर क्लिक करें।
> 2. `Hisab-Kitab.apk` फ़ाइल आपके फ़ोन में डाउनलोड हो जाएगी।
> 3. फ़ाइल पर क्लिक करें और **"Install"** दबाएं।
> 4. यह ऐप आपके फ़ोन में हमेशा के लिए **100% ऑफ़लाइन** काम करेगा (बिना इंटरनेट के)!

---

## 💻 कंप्यूटर / लैपटॉप पर कैसे चलाएं?

कंप्यूटर पर चलाने के लिए किसी इंस्टॉलेशन या इंटरनेट की ज़रूरत नहीं है:
1. इस रिपॉजिटरी की `index.html` फ़ाइल डाउनलोड करें।
2. उस पर डबल-क्लिक करें — यह तुरंत Google Chrome, Edge, या Firefox में खुल जाएगी।

---

## 💡 Accounting & Balance Rules

यह लेज़र आपके दैनिक लेन-देन के हिसाब से काम करता है:

### 1. Meaning of Credit & Debit
| Type | Hindi Meaning | Explanation | Effect on Balance |
| :--- | :--- | :--- | :--- |
| **🟢 CREDIT** | **Mujhe Mile** | Money received by me from the customer (unhone mujhe diye ya wapas kiye) | **Increases** what I owe them (+) |
| **🔴 DEBIT** | **Unhone Liye** | Money taken by the customer from me (unhone mujhse liye ya kharch karwaye) | **Decreases** what I owe them (-) |

### 2. Balance Formula
$$\text{Net Balance} = (\text{Opening Balance}) + \text{Total Credit} - \text{Total Debit}$$

- **Positive Balance ($> 0$) 🟢 GREEN**: **"Mujhe unko dene hain ₹X"** (They gave you more than they took).
- **Negative Balance ($< 0$) 🔴 RED**: **"Unse mujhe lene hain ₹X"** (They took more than they gave).
- **Zero Balance ($= 0$) ⚖️ GRAY**: **"Hisab Barabar"** (Account is settled).

### 3. Brother Example Walkthrough
1. Brother gives you ₹50,000 first $\rightarrow$ **Opening Credit of ₹50,000**.
2. Brother takes ₹50 (Chai) $\rightarrow$ **Debit ₹50** $\rightarrow$ Running Balance: **₹49,950** (Mujhe dene hain).
3. Brother takes ₹1,000 (Bike repair) $\rightarrow$ **Debit ₹1,000** $\rightarrow$ Running Balance: **₹48,950**.
4. Brother takes ₹2,000 (Grocery) $\rightarrow$ **Debit ₹2,000** $\rightarrow$ Running Balance: **₹46,950**.
5. Brother takes ₹1,500 (Recharge) $\rightarrow$ **Debit ₹1,500** $\rightarrow$ Running Balance: **₹45,450** (🟢 Mujhe unko dene hain).

---

## ✨ Features

- **Home Dashboard**:
  - Overview cards: *Kul Dene Hain* (🟢 Green), *Kul Lene Hain* (🔴 Red), *Total Customers*, and *Net Difference*.
  - Search box by customer name, phone, or notes.
  - Filter chips: *Sabhi*, *Dene Hain*, *Lene Hain*, *Barabar*.
  - Customer cards with quick avatar, transaction count, and large color-coded balance badges.

- **Customer Ledger Page**:
  - Full breadcrumb and back navigation.
  - Big 4-card summary: Opening Balance, Kul Credit, Kul Debit, and Net Balance banner.
  - Fast inline transaction entry form with 1-click **Credit (+)** and **Debit (-)** toggles.
  - Auto-incrementing serial number per customer (`#1`, `#2`, `#3`...).
  - Running balance calculated chronologically for each entry.
  - Sort order toggle: **Newest First** ⬇️ or **Oldest First** ⬆️.
  - Filters: Search in vivaran/amount, filter by type (Credit/Debit), and filter by date range.
  - Edit ✏️ and Delete 🗑️ with safety confirmation modals.

- **Backup & Portability**:
  - **Export Backup (JSON)**: Saves your entire database into a single `.json` file that you can keep in Google Drive, email, or a USB flash drive.
  - **Import Backup**: Restore anytime with options to either **Replace** or **Merge** records.
  - **Export CSV**: Download an Excel-compatible CSV file for any individual customer statement.
  - **Print / PDF**: Clean, print-ready formal A4 statement formatted with `@media print`.

- **Design & Quality**:
  - Indian currency formatting (`₹1,50,000`).
  - Dark mode and light mode with instant toggle.
  - 100% offline (no external fonts, scripts, or icons needed; pure SVG).
  - Preloaded with realistic sample data to test, plus a one-click **Clear Sample Data** button.

---

## ⚙️ Customizing Accounting Logic

If you ever want to change the labels or reverse the signs, open `index.html` in Notepad or any text editor and edit the `ACCOUNTING_CONFIG` block at lines 730–748:

```javascript
const ACCOUNTING_CONFIG = {
  creditMultiplier: 1,    // Credit increases what I owe them (+1)
  debitMultiplier: -1,   // Debit decreases what I owe them (-1)
  openingCreditMultiplier: 1,
  openingDebitMultiplier: -1,

  labelCredit: "Credit (Mujhe Mile)",
  labelDebit: "Debit (Unhone Liye)",
  labelIOwe: "Mujhe unko dene hain",
  labelTheyOwe: "Unse mujhe lene hain",
  labelSettled: "Hisab Barabar"
};
```
