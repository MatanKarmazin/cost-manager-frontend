# Cost Manager Frontend – React & IndexedDB

A **client-side expense tracking web application** built with **React** and **Material UI**, demonstrating advanced browser-side persistence using **IndexedDB**, real-time **currency conversion**, and **data visualization**.

**Live Demo**:
[https://cost-manager-frontend-71yh.onrender.com](https://cost-manager-frontend-71yh.onrender.com)

---

## What This Project Demonstrates

* Modern React application architecture
* Client-side persistence using IndexedDB
* Custom abstraction over browser storage APIs
* Integration with external REST APIs
* Data visualization with charts
* Clean separation of UI, logic, and data layers
* Real-world frontend engineering patterns

---

## Application Overview

The application allows users to **track personal expenses locally in the browser**, without a backend server.

Core capabilities include:

* Creating expenses with amount, currency, category, and description
* Persisting data using IndexedDB (instead of `localStorage`)
* Generating monthly expense reports
* Converting currencies dynamically
* Visualizing spending trends and distributions

All data is stored **entirely on the client**, making the app fast, offline-friendly, and privacy-preserving.

---

## Architecture Overview

The project follows a **clean frontend architecture**:

* **UI Layer** – React components & Material UI
* **Data Layer** – Custom IndexedDB abstraction
* **Logic Layer** – Reporting, aggregation, and conversion logic
* **External Integration** – Exchange rates API

A custom `idb.js` module:

* Wraps IndexedDB with Promises
* Abstracts low-level database logic
* Separates persistence concerns from UI code
* Exists in both React-module and vanilla JS versions (for testing)

---

## Tech Stack

* **Frontend**: React, Material UI, JavaScript (ES6+)
* **Storage**: IndexedDB (custom Promise-based wrapper)
* **Charts**: Chart.js
* **External API**: Frankfurter Exchange Rates
* **Build Tooling**: Vite

---

## Running the Project (Local)

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The app will be available at:

```
http://localhost:5173
```

---

## Authors

* **Matan Karmazin**
* **Lior Zvieli**
* **Yoni Libman**
