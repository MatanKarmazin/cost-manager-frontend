/* idb.module.js
 * Module version for React (Vite).
 * Same behavior as vanilla, but exported.
 */

const STORE_NAME = 'costs';
const DEFAULT_RATES = { USD: 1, GBP: 1, EURO: 1, ILS: 1 };
const RATES_URL_STORAGE_KEY = 'costManagerRatesUrl';

const DEFAULT_RATES_URL =
  "https://matankarmazin.github.io/cost-manager-frontend/rates/rates.json";

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function normalizeCurrency(cur) {
  return String(cur || '')
    .trim()
    .toUpperCase();
}

function todayParts() {
  const d = new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function validateRatesObject(rates) {
  if (!rates || typeof rates !== 'object') {
    return false;
  }
  const codes = ['USD', 'GBP', 'EURO', 'ILS'];
  for (let i = 0; i < codes.length; i += 1) {
    if (!isFiniteNumber(rates[codes[i]]) || rates[codes[i]] <= 0) {
      return false;
    }
  }
  return true;
}

function normalizeRatesResponse(raw) {
  // Assignment format: {USD:1, GBP:0.6, EURO:0.7, ILS:3.4}
  if (validateRatesObject(raw)) {
    return raw;
  }

  // Frankfurter format: { base:"USD", rates:{ GBP:..., EUR:..., ILS:... } }
  if (raw && typeof raw === 'object' && raw.rates && typeof raw.rates === 'object') {
    const out = {
      USD: 1,
      GBP: raw.rates.GBP,
      EURO: raw.rates.EUR ?? raw.rates.EURO, // accept EUR too
      ILS: raw.rates.ILS,
    };

    if (validateRatesObject(out)) {
      return out;
    }
  }

  return null;
}

function getStoredRatesUrl() {
  try {
    const url = localStorage.getItem(RATES_URL_STORAGE_KEY);
    return url && url.trim() ? url.trim() : DEFAULT_RATES_URL;
  } catch (e) {
    return DEFAULT_RATES_URL;
  }
}

function fetchRatesMaybe() {
  const url = getStoredRatesUrl();
  console.log("Rates URL:", url);

  if (!url) {
    console.warn("No rates URL saved, using DEFAULT_RATES");
    return Promise.resolve(DEFAULT_RATES);
  }

  return fetch(url)
    .then((resp) => {
      if (!resp.ok) throw new Error(`Rates fetch failed: HTTP ${resp.status}`);
      return resp.json();
    })
    .then((raw) => {
      console.log("Fetched rates:", raw);
      const normalized = normalizeRatesResponse(raw);
      if (!normalized) throw new Error("Invalid rates JSON format");
      return normalized;
    })
    .catch((err) => {
      console.warn("Rates fetch failed, using DEFAULT_RATES:", err);
      return DEFAULT_RATES;
    });
}

function convertAmount(amount, fromCurrency, toCurrency, rates) {
  const fromCur = normalizeCurrency(fromCurrency);
  const toCur = normalizeCurrency(toCurrency);

  const safeRates = validateRatesObject(rates) ? rates : DEFAULT_RATES;

  if (fromCur === toCur) {
    return amount;
  }

  const usd = amount / safeRates[fromCur];
  return usd * safeRates[toCur];
}

function reqToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
  });
}

function txDoneToPromise(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error || new Error('IndexedDB transaction error'));
    tx.onabort = () => reject(tx.error || new Error('IndexedDB transaction aborted'));
  });
}

function ensureDbSchema(db) {
  if (!db.objectStoreNames.contains(STORE_NAME)) {
    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    store.createIndex('year', 'year', { unique: false });
    store.createIndex('month', 'month', { unique: false });
    store.createIndex('year_month', ['year', 'month'], { unique: false });
  }
}

export function openCostsDB(databaseName, databaseVersion) {
  return new Promise((resolve, reject) => {
    if (!databaseName || typeof databaseName !== 'string') {
      reject(new Error('databaseName must be a string'));
      return;
    }
    if (!isFiniteNumber(databaseVersion)) {
      reject(new Error('databaseVersion must be a number'));
      return;
    }

    const openReq = indexedDB.open(databaseName, databaseVersion);

    openReq.onupgradeneeded = (e) => {
      const db = e.target.result;
      ensureDbSchema(db);
    };

    openReq.onerror = () => {
      reject(openReq.error || new Error('Failed to open IndexedDB'));
    };

    openReq.onsuccess = () => {
      const db = openReq.result;

      function addCost(cost) {
        return new Promise((resolveAdd, rejectAdd) => {
          if (!cost || typeof cost !== 'object') {
            rejectAdd(new Error('cost must be an object'));
            return;
          }

          const sum = cost.sum;
          const currency = normalizeCurrency(cost.currency);
          const category = String(cost.category || '').trim();
          const description = String(cost.description || '').trim();

          if (!isFiniteNumber(sum)) {
            rejectAdd(new Error('cost.sum must be a number'));
            return;
          }
          if (['USD', 'GBP', 'EURO', 'ILS'].indexOf(currency) === -1) {
            rejectAdd(new Error(`Unsupported currency: ${currency}`));
            return;
          }
          if (!category) {
            rejectAdd(new Error('cost.category is required'));
            return;
          }

          const dateParts = todayParts();

          const newItem = {
            sum,
            currency,
            category,
            description,
            year: dateParts.year,
            month: dateParts.month,
            day: dateParts.day,
            Date: { day: dateParts.day },
          };

          const tx = db.transaction([STORE_NAME], 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const addReq = store.add(newItem);

          reqToPromise(addReq)
            .then((id) => {
              newItem.id = id;
              return txDoneToPromise(tx);
            })
            .then(() => resolveAdd(newItem))
            .catch((err) => rejectAdd(err));
        });
      }

      function getReport(year, month, targetCurrency) {
        return fetchRatesMaybe().then((rates) => {
          const y = year;
          const m = month;
          const outCur = normalizeCurrency(targetCurrency);

          if (!isFiniteNumber(y) || !isFiniteNumber(m)) {
            throw new Error('year and month must be numbers');
          }
          if (m < 1 || m > 12) {
            throw new Error('month must be in range 1..12');
          }
          if (['USD', 'GBP', 'EURO', 'ILS'].indexOf(outCur) === -1) {
            throw new Error(`Unsupported currency: ${outCur}`);
          }

          const tx = db.transaction([STORE_NAME], 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const idx = store.index('year_month');
          const range = IDBKeyRange.only([y, m]);

          const results = [];

          return new Promise((resolveQuery, rejectQuery) => {
            const cursorReq = idx.openCursor(range);

            cursorReq.onsuccess = (e) => {
              const cursor = e.target.result;
              if (cursor) {
                results.push(cursor.value);
                cursor.continue();
              } else {
                resolveQuery(results);
              }
            };

            cursorReq.onerror = () => {
              rejectQuery(cursorReq.error || new Error('Cursor failed'));
            };
          })
            .then((allItems) => txDoneToPromise(tx).then(() => allItems))
            .then((allItems) => {
              const costsOut = [];
              let total = 0;

              for (let i = 0; i < allItems.length; i += 1) {
                const item = allItems[i];
                const converted = convertAmount(item.sum, item.currency, outCur, rates);
                total += converted;

                costsOut.push({
                  sum: item.sum,
                  currency: item.currency,
                  category: item.category,
                  description: item.description,
                  Date: { day: item.day },
                });
              }

              return {
                year: y,
                month: m,
                costs: costsOut,
                total: { currency: outCur, total: Math.round(total * 100) / 100 },
              };
            });
        });
      }

      function getCategoryTotals(year, month, targetCurrency) {
  return fetchRatesMaybe().then((rates) => {
    const y = year;
    const m = month;
    const outCur = normalizeCurrency(targetCurrency);

    if (!isFiniteNumber(y) || !isFiniteNumber(m)) {
      throw new Error("year and month must be numbers");
    }
    if (m < 1 || m > 12) {
      throw new Error("month must be in range 1..12");
    }
    if (["USD", "GBP", "EURO", "ILS"].indexOf(outCur) === -1) {
      throw new Error(`Unsupported currency: ${outCur}`);
    }

    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);
    const idx = store.index("year_month");
    const range = IDBKeyRange.only([y, m]);

    const items = [];

    return new Promise((resolveQuery, rejectQuery) => {
      const cursorReq = idx.openCursor(range);

      cursorReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          resolveQuery(items);
        }
      };

      cursorReq.onerror = () => {
        rejectQuery(cursorReq.error || new Error("Cursor failed"));
      };
    })
      .then((allItems) => txDoneToPromise(tx).then(() => allItems))
      .then((allItems) => {
        const map = {}; // category -> total
        for (let i = 0; i < allItems.length; i += 1) {
          const it = allItems[i];
          const converted = convertAmount(it.sum, it.currency, outCur, rates);
          const cat = String(it.category || "Uncategorized");
          map[cat] = (map[cat] || 0) + converted;
        }

        // Convert to array for chart
        return Object.keys(map).map((cat) => ({
          category: cat,
          total: Math.round(map[cat] * 100) / 100
        }));
      });
  });
}

function getYearMonthlyTotals(year, targetCurrency) {
  return fetchRatesMaybe().then((rates) => {
    const y = year;
    const outCur = normalizeCurrency(targetCurrency);

    if (!isFiniteNumber(y)) {
      throw new Error("year must be a number");
    }
    if (["USD", "GBP", "EURO", "ILS"].indexOf(outCur) === -1) {
      throw new Error(`Unsupported currency: ${outCur}`);
    }

    const tx = db.transaction([STORE_NAME], "readonly");
    const store = tx.objectStore(STORE_NAME);
    const idx = store.index("year");

    const range = IDBKeyRange.only(y);
    const items = [];

    return new Promise((resolveQuery, rejectQuery) => {
      const cursorReq = idx.openCursor(range);

      cursorReq.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          items.push(cursor.value);
          cursor.continue();
        } else {
          resolveQuery(items);
        }
      };

      cursorReq.onerror = () => {
        rejectQuery(cursorReq.error || new Error("Cursor failed"));
      };
    })
      .then((allItems) => txDoneToPromise(tx).then(() => allItems))
      .then((allItems) => {
        const months = new Array(12).fill(0);

        for (let i = 0; i < allItems.length; i += 1) {
          const it = allItems[i];
          const converted = convertAmount(it.sum, it.currency, outCur, rates);
          const m = Number(it.month);
          if (m >= 1 && m <= 12) {
            months[m - 1] += converted;
          }
        }

        // Chart array: { month: "Jan", total: 123 }
        const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return labels.map((label, idx2) => ({
          month: label,
          total: Math.round(months[idx2] * 100) / 100
        }));
      });
  });
}

      resolve({ addCost, getReport, getCategoryTotals, getYearMonthlyTotals });
    };
  });
}

export default { openCostsDB };
