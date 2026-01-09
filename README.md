# Cost Manager Frontend – React & IndexedDB

A **client-side expense tracking web application** built with **React** and **Material UI**, demonstrating advanced browser-side persistence using **IndexedDB**, external API integration, and data visualization.

**Live Demo**:  
https://cost-manager-frontend-71yh.onrender.com

---

## What This Project Demonstrates

- Modern React application architecture
- Client-side persistence beyond `localStorage`
- Clean separation of UI, logic, and data layers
- Integration with external REST APIs
- Data aggregation and visualization
- Real-world frontend engineering best practices

---

## Application Overview

The system is a **fully client-side expense manager**, designed to store and process data directly in the browser without relying on a backend server.

The application provides:
- Expense creation with amount, currency, category, and description
- Persistent local storage using IndexedDB
- Monthly reporting with dynamic currency conversion
- Visual analysis of spending patterns

All data is stored **locally on the client**, making the application fast, offline-capable, and privacy-preserving.

---

## Architecture Overview

The application follows a layered frontend architecture:

- **UI Layer** – React components and Material UI
- **Logic Layer** – Aggregation, reporting, and currency conversion
- **Data Layer** – Custom IndexedDB abstraction
- **External Integration** – Exchange rates API (Frankfurter)

A custom `idb.js` module is used to:
- Wrap IndexedDB operations with Promises
- Abstract low-level browser APIs
- Separate persistence logic from UI components
- Support both React-based and vanilla JavaScript usage (for testing)

---

## Tech Stack

- **Frontend**: React, Material UI, JavaScript (ES6+)
- **Storage**: IndexedDB (custom Promise-based wrapper)
- **Charts**: Chart.js
- **API**: Frankfurter Exchange Rates
- **Build Tooling**: Vite

---

## Running the Project (Local)

```bash
npm install
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## Authors

* **Matan Karmazin**
* **Lior Zvieli**
* **Yoni Libman**
