# 📒 Hisab Kitab (हिसाब किताब) - Offline Daily Ledger & DBMS

<p align="center">
  <a href="https://github.com/AmanC52/Hisab-KItab/releases/download/v1.0.0/Hisab-Kitab.apk">
    <img src="https://img.shields.io/badge/📱_Download-Android_APK-brightgreen?style=for-the-badge&logo=android" alt="Download Android APK" height="48">
  </a>
  &nbsp;&nbsp;
  <a href="https://github.com/AmanC52/Hisab-KItab/releases/download/v1.0.0/Hisab-Kitab.exe">
    <img src="https://img.shields.io/badge/💻_Download-Windows_EXE-blue?style=for-the-badge&logo=windows" alt="Download Windows EXE" height="48">
  </a>
</p>

---

### ⬇️ सीधे डाउनलोड करें (Direct Download Links):

| प्लेटफ़ॉर्म | डाउनलोड लिंक | विवरण |
| :--- | :--- | :--- |
| 📱 **Android मोबाइल** | 👉 **[Download Hisab-Kitab.apk](https://github.com/AmanC52/Hisab-KItab/releases/download/v1.0.0/Hisab-Kitab.apk)** | फ़ोन के लिए रेडी ऐप (100% ऑफ़लाइन) |
| 💻 **Windows कंप्यूटर / लैपटॉप** | 👉 **[Download Hisab-Kitab.exe](https://github.com/AmanC52/Hisab-KItab/releases/download/v1.0.0/Hisab-Kitab.exe)** | कंप्यूटर पर डबल-क्लिक करके सीधे चलाएं |
| 🗄️ **DBMS डेटाबेस फ़ाइल** | `hisab_kitab_dbms.json` | सभी खातों और लेन-देन का सुरक्षित डेटाबेस |

---

## 💻 कंप्यूटर / लैपटॉप पर कैसे चलाएं?

1. ऊपर दिए गए **[Download Hisab-Kitab.exe](https://github.com/AmanC52/Hisab-KItab/releases/download/v1.0.0/Hisab-Kitab.exe)** लिंक से फ़ाइल डाउनलोड करें।
2. डाउनलोड होने के बाद **`Hisab-Kitab.exe`** पर डबल-क्लिक करें।
3. यह बिना किसी ब्राउज़र बार के, एक स्टैंडअलोन डेस्कटॉप सॉफ़्टवेयर की तरह खुल जाएगा।
4. कंप्यूटर में किसी इंटरनेट या इंस्टॉलेशन की ज़रूरत नहीं है!

---

## 📱 मोबाइल फ़ोन में कैसे इनस्टॉल करें?

1. अपने मोबाइल से **[Download Hisab-Kitab.apk](https://github.com/AmanC52/Hisab-KItab/releases/download/v1.0.0/Hisab-Kitab.apk)** डाउनलोड करें।
2. डाउनलोड पूरा होने पर फ़ाइल पर टैप करें और **"Install"** दबाएं।
3. आपके फ़ोन में नए **₹ आइकॉन** के साथ **Hisab Kitab** ऐप आ जाएगा।

---

## 🗄️ DBMS (Database Management System) क्या है और डेटा कहाँ रहता है?

इस ऐप में आपका सारा डेटा एक विशेष डेटाबेस फ़ाइल में सुरक्षित रहता है जिसे **DBMS फ़ाइल** कहते हैं:
- **फ़ाइल का नाम:** `hisab_kitab_dbms.json`
- **विशेषताएं:**
  - **Relational Tables:** Customers (खाते), Transactions (लेन-देन), Audit Logs (ऑडिट हिस्ट्री), और Settings।
  - **Auto-Sync:** जब भी आप कोई नई एंट्री जोड़ते या बदलते हैं, डेटा तुरंत स्थानीय रूप से सेव हो जाता है।
  - **1-Click Backup:** ऐप में ऊपर दिए गए **"Export DBMS"** बटन से आप जब चाहें पूरे डेटाबेस की कॉपी अपने पेनड्राइव या गूगल ड्राइव में रख सकते हैं।
  - **Restore / Import:** **"Import DBMS"** से कभी भी अपना पुराना डेटा किसी भी कंप्यूटर या फ़ोन पर वापस लोड कर सकते हैं।

---

## 💡 लेन-देन के नियम (Credit / Debit Accounting Rules)

| प्रकार | हिंदी अर्थ | खाते के बैलेंस पर असर |
| :--- | :--- | :--- |
| **🟢 CREDIT** | **मुझे मिले** (ग्राहक/भाई ने मुझे पैसे दिए या वापस किए) | **बैलेंस बढ़ता है (+)** (मुझे उनको देने हैं) |
| **🔴 DEBIT** | **उन्होंने लिए** (ग्राहक/भाई ने मुझसे पैसे लिए या खर्च करवाए) | **बैलेंस घटता है (-)** (उनसे मुझे लेने हैं) |

### नेट बैलेंस फॉर्मूला:
$$\text{Net Balance} = (\text{Opening Balance}) + \text{Total Credit} - \text{Total Debit}$$

- **Positive ($> 0$) 🟢 GREEN:** **"मुझे उनको देने हैं ₹X"** *(उन्होंने मुझे ज़्यादा दिए थे)*
- **Negative ($< 0$) 🔴 RED:** **"उनसे मुझे लेने हैं ₹X"** *(उन्होंने मुझसे ज़्यादा ले लिए हैं)*
- **Zero ($= 0$) ⚖️ GRAY:** **"हिसाब बराबर"** *(खाता चुकता हो चुका है)*

#### भाई वाला उदाहरण (Brother's Example Walkthrough):
1. भाई ने शुरू में ₹50,000 दिए $\rightarrow$ **Opening Credit ₹50,000** (🟢 *मुझे देने हैं ₹50,000*)
2. चाय और नाश्ता $\rightarrow$ **Debit ₹50** $\rightarrow$ बकाया बैलेंस: **₹49,950**
3. बाइक रिपेयर $\rightarrow$ **Debit ₹1,000** $\rightarrow$ बकाया बैलेंस: **₹48,950**
4. राशन व पेट्रोल $\rightarrow$ **Debit ₹2,000** $\rightarrow$ बकाया बैलेंस: **₹46,950**
5. मोबाइल रीचार्ज $\rightarrow$ **Debit ₹1,500** $\rightarrow$ बकाया बैलेंस: **₹45,450** (🟢 *मुझे उनको देने हैं ₹45,450*)

---

## ✨ मुख्य फ़ीचर्स (Key Features)

- ⚡ **Jaldi Rakam Chunein (Quick Amount Chips):** `+₹50`, `+₹100`, `+₹500`, `+₹1,000`, `+₹2,000`
- 🏷️ **Vivaran Tags (Quick Reasons):** `[Chai & Nashta]`, `[Petrol]`, `[Bike Repair]`, `[Kirana Saman]`, `[Cash Diya]`, `[UPI Wapas]`
- 🤝 **1-Click Hisab Chukta (Settle Account):** एक क्लिक में बकाया हिसाब को बराबर (₹0) करने की एंट्री।
- 📲 **WhatsApp Reminder:** ग्राहक को तुरंत प्री-फ़ॉर्मेटेड हिसाब मैसेज शेयर करने की सुविधा।
- 💳 **Payment Modes:** Cash, UPI, Bank Transfer, Udhar टैग।
- 📄 **Export & Print:** पूरा लेज़र Excel CSV और PDF प्रिंट फॉर्मेट में डाउनलोड करें।
- 🌗 **Dark Mode & Light Mode:** आँखों के आराम के लिए डार्क थीम।
- 🔒 **100% ऑफ़लाइन और प्राइवेट:** आपका डेटा कभी किसी बाहरी सर्वर पर नहीं जाता, सिर्फ़ आपके डिवाइस पर रहता है।
