const RATES_URL_KEY = "costManagerRatesUrl";

// Default: Frankfurter (base USD, fetch GBP/EUR/ILS)
export const DEFAULT_RATES_URL =
  "https://api.frankfurter.dev/v1/latest?base=USD&symbols=GBP,EUR,ILS";

export function loadRatesUrl() {
  const url = localStorage.getItem(RATES_URL_KEY);
  return url && url.trim() ? url.trim() : DEFAULT_RATES_URL;
}

export function saveRatesUrl(url) {
  localStorage.setItem(RATES_URL_KEY, String(url || "").trim());
}

// Accepts either:
// A) { "USD":1, "GBP":1.8, "EURO":0.7, "ILS":3.4 }   (assignment format)
// B) { base:"USD", rates:{ GBP:..., EUR:..., ILS:... } } (Frankfurter format)
export function normalizeRates(raw) {
  // Case A — already in assignment format
  if (
    raw &&
    typeof raw === "object" &&
    raw.USD !== undefined &&
    raw.GBP !== undefined &&
    raw.EURO !== undefined &&
    raw.ILS !== undefined
  ) {
    return {
      USD: Number(raw.USD),
      GBP: Number(raw.GBP),
      EURO: Number(raw.EURO),
      ILS: Number(raw.ILS)
    };
  }

  // Case B — Frankfurter format
  // { base: "USD", rates: { GBP: 0.79, EUR: 0.92, ILS: 3.4 } }
  if (raw && raw.base && raw.rates) {
    if (raw.base !== "USD") {
      throw new Error("Frankfurter API must use base=USD");
    }

    if (!raw.rates.GBP || !raw.rates.EUR || !raw.rates.ILS) {
      throw new Error("Frankfurter response missing currencies");
    }

    return {
      USD: 1,
      GBP: Number(raw.rates.GBP),
      EURO: Number(raw.rates.EUR), // EUR → EURO
      ILS: Number(raw.rates.ILS)
    };
  }

  throw new Error("Unsupported rates JSON format");
}

export async function fetchRates(url) {
  const resp = await fetch(url, { method: "GET" });
  if (!resp.ok) {
    throw new Error(`Rates fetch failed (HTTP ${resp.status})`);
  }
  const raw = await resp.json();
  const rates = normalizeRates(raw);

  // Validate
  const codes = ["USD", "GBP", "EURO", "ILS"];
  for (let i = 0; i < codes.length; i += 1) {
    const v = rates[codes[i]];
    if (!Number.isFinite(v) || v <= 0) {
      throw new Error("Invalid rate values (must be positive numbers).");
    }
  }
  return rates;
}

// Convert using rates where rates[X] = how much X equals 1 USD
export function convertAmount(amount, from, to, rates) {
  const fromCur = String(from).toUpperCase();
  const toCur = String(to).toUpperCase();

  if (fromCur === toCur) return amount;

  // from -> USD -> to
  const usd = amount / rates[fromCur];
  return usd * rates[toCur];
}
