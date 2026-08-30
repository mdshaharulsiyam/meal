# Mess Meal Management Mobile App — Product Requirement Document (PRD)

A production-ready mobile application designed to manage daily meals, grocery/bazar expenses, utilities, deposits, and settlement calculations (*Dena-Paona* / দেনা-পাওনা) for hostels, flats, and bachelor messes.

---

## 1. System Operating Modes (সিস্টেম অপারেটিং মোড)

The app provides two distinct, non-conflicting operational modes selected during Room creation.

```
+-----------------------------------------------------------------------------------+
|                            SELECTABLE ROOM MODES                                  |
+----------------------------------------+------------------------------------------+
|  MODE 1: Single Manager System         |  MODE 2: Collaborative System            |
|  (একক ম্যানেজার সিস্টেম)                |  (যৌথ / গণতান্ত্রিক সিস্টেম)               |
+----------------------------------------+------------------------------------------+
| * Centralized control by Manager       | * Decentralized shared control           |
| * Handles both Joma (Deposit) & Bazar  | * Only Bazar tracking (No Joma model)    |
| * Optional delegated edit access       | * All members can add/update everything  |
| * Members are Read-Only by default     | * Shared responsibility across members   |
| * Default meal automation per member   | * Self meal entry & expense logging      |
+----------------------------------------+------------------------------------------+
```

---

## 2. Bilingual Support & Localization (i18n / বহুভাষিক সমর্থন)

* **Language Switcher:** Instant UI toggle between **English** and **বাংলা (Bengali)** without reloading.
* **Localized Terminology Mapping:**

| Concept | English Label | Bengali Label (বাংলা পরিভাষা) |
| :--- | :--- | :--- |
| Single Manager Mode | Single Manager Mode | একক ম্যানেজার সিস্টেম |
| Collaborative Mode | Collaborative Mode | যৌথ মেস সিস্টেম |
| Deposit / Advance | Joma / Deposit | জমা / অ্যাডভান্স |
| Grocery & Food Expense | Bazar | বাজার খরচ |
| Daily Meals | Meal Count | মিল সংখ্যা |
| Shared Utilities | Utilities & Bills | গ্যাস, বিদ্যুৎ, পানি ও খালা বিল |
| Meal Rate | Meal Rate | মিল রেট |
| Total Cost | Total Cost | মোট খরচ |
| Net Balance | Due / Refund (Dena-Paona) | দেনা-পাওনা / বকেয়া-ফেরত |

* **Numeral Formats:** Support for both Western Arabic (`0, 1, 2...`) and Eastern Bengali (`০, ১, ২...`) digits.
* **Currency Display:** Localized Bangladeshi Taka (`৳` / `BDT`).

---

## 3. Mode 1: Single Manager System (একক ম্যানেজার সিস্টেম)

### 3.1 Room Setup & Member Management
* **Create Room:** Manager creates a room/mess profile.
* **Add Users:** Manager adds members via phone number, invite link, or manual name entry.
* **Delegated Edit Permissions:**
  * By default, all members have **Read-Only** access.
  * Manager can grant edit access to specific trusted members.
  * *Liability Notice:* The Manager assumes full responsibility for any entries made by delegated editors.

### 3.2 Automated & Manual Meal Tracking
* **Default Meal Setting:** Set a default daily meal count for each user (e.g., 2 meals/day). The system auto-fills daily meals based on this default.
* **Daily Exception Updates:** If a member turns off a meal or eats extra, the Manager simply updates that specific date and user.
* **Date Selection:** Manager can select any date within the active month to update entries.
* **Month-Lock Security:** Past closed months are permanently locked and cannot be edited.

### 3.3 Financial Inputs (Joma & Bazar)
* **Joma (Cash Deposit / Advance):** Manager logs cash, bKash, or bank advance payments received from users.
* **Bazar Entry:** Manager records grocery expenses (amount, date, description, receipt image) and attributes them either to the general fund or a specific user.

### 3.4 Utility & Fixed Bills Management
* Manager adds shared utility bills (Electricity, Gas, Water, Internet, Cook/Maid salary, Waste disposal).
* Utilities are kept separate from the meal rate and split equally among all room members.

### 3.5 Calculation Engine (Single Manager Mode)
$$\text{Meal Rate} = \frac{\text{Total Bazar Expenses}}{\text{Total Room Meals}}$$

$$\text{Personal Meal Cost} = \text{Member Total Meals} \times \text{Meal Rate}$$

$$\text{Personal Utility Share} = \frac{\text{Total Utility Bills}}{\text{Total Room Members}}$$

$$\text{Total Personal Cost} = \text{Personal Meal Cost} + \text{Personal Utility Share}$$

$$\text{Net Balance (দেনা-পাওনা)} = \left(\text{Personal Joma} + \text{Personal Bazar}\right) - \text{Total Personal Cost}$$

* **Balance Interpretation:**
  * Positive ($> 0$ ৳): Member will receive a refund (**পাবেন**).
  * Negative ($< 0$ ৳): Member has an outstanding due (**দিতে হবে**).

---

## 4. Mode 2: Collaborative System (যৌথ সিস্টেম)

### 4.1 Shared Access & Entry
* **Equal Permissions:** Every member in the room can add, edit, and update daily meals, bazar entries, and utilities.
* **No Joma Model:** Excludes deposit collections. Financial tracking is driven directly by individual member Bazar contributions.

### 4.2 Calculation Engine (Collaborative Mode)
$$\text{Meal Rate} = \frac{\sum(\text{All Member Bazar})}{\text{Total Room Meals}}$$

$$\text{Personal Meal Cost} = \text{Member Total Meals} \times \text{Meal Rate}$$

$$\text{Personal Utility Share} = \frac{\text{Total Utility Bills}}{\text{Total Room Members}}$$

$$\text{Total Personal Cost} = \text{Personal Meal Cost} + \text{Personal Utility Share}$$

$$\text{Net Balance (দেনা-পাওনা)} = \text{Personal Bazar Spent} - \text{Total Personal Cost}$$

---

## 5. Dashboard, Reports & PDF Export

### 5.1 Real-Time Member Dashboard
* Live display of Total Meals, Total Bazar, Total Joma (Mode 1), Total Utilities, and current Meal Rate.
* Personal summary card showing personal meal count, individual costs, and net *Dena-Paona* balance.

### 5.2 Month-End PDF Report Generation
* One-tap export of the complete monthly overview to a clean, printable PDF in Bengali or English.
* PDF breakdown includes:
  * Full member ledger matrix (Day-by-day meals).
  * Itemized Bazar and Utility expense list.
  * Final Settlement Table (Total Meals, Meal Cost, Utility Share, Joma/Bazar, and Final Due/Refund).
