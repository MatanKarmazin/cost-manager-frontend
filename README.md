# Cost Manager – React & IndexedDB

A **client-side expense tracking web app** built with **React** and **Material UI**, featuring **IndexedDB persistence**, **currency conversion**, and **data visualization**.

🔗 **Live Demo**: [https://cost-manager-frontend-71yh.onrender.com](https://cost-manager-frontend-71yh.onrender.com)

---

## Highlights

* React + MUI (desktop-first UI)
* Custom **Promise-based IndexedDB wrapper**
* Monthly reports with currency conversion
* Pie & Bar charts for spending analysis
* External API integration (Frankfurter)

---

## What It Does

* Add expenses (amount, currency, category, description)
* Generate monthly reports (month/year + currency)
* Visualize data:

  * Pie chart: category distribution
  * Bar chart: yearly monthly totals

---

## Tech Stack

* **Frontend**: React, Material UI, JavaScript (ES6+)
* **Storage**: IndexedDB (custom abstraction)
* **Charts**: Chart.js
* **API**: Frankfurter Exchange Rates

---

## Architecture Note

Includes a custom `idb.js` library that:

* Wraps IndexedDB with Promises
* Separates data access from UI logic
* Exists in both React-module and vanilla JS versions (for testing)

---

## Why This Project

Demonstrates:

* Async browser APIs
* Client-side persistence beyond `localStorage`
* Clean React architecture
* Real-world data visualization & API usage

---

## Local Setup

```bash
npm install
npm run dev
```

---

## Author

**Matan Karmazin** & **Lior Zvieli** & **Yoni Libman**
