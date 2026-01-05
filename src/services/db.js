import { openCostsDB } from "./idb"; // <-- your module version

const DB_NAME = "costsdb";
const DB_VERSION = 1;

let g_DbPromise = null;

export async function getDb() {
  if (!g_DbPromise) {
    g_DbPromise = openCostsDB(DB_NAME, DB_VERSION);
  }
  return g_DbPromise;
}
