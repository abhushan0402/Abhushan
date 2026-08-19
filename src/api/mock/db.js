/**
 * Lightweight localStorage-backed table store used to simulate a persistent
 * backend while no real API exists. Swap `USE_MOCK_API` off in `src/api/config.js`
 * once a real backend is available - nothing outside `src/api/mock` depends on this file.
 */
const STORAGE_PREFIX = "aurelia_admin_mock:";

function readStorage(key) {
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // storage unavailable (private mode / quota) - fail silently, state stays in-memory only
  }
}

const memoryCache = new Map();

export function getTable(name, seedFn) {
  if (memoryCache.has(name)) return memoryCache.get(name);
  const fromStorage = readStorage(name);
  const table = fromStorage ?? seedFn();
  memoryCache.set(name, table);
  if (!fromStorage) writeStorage(name, table);
  return table;
}

export function saveTable(name, table) {
  memoryCache.set(name, table);
  writeStorage(name, table);
}

export function resetTable(name) {
  memoryCache.delete(name);
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + name);
  } catch {
    // ignore
  }
}

export function resetAllMockData() {
  memoryCache.clear();
  try {
    Object.keys(window.localStorage)
      .filter((key) => key.startsWith(STORAGE_PREFIX))
      .forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // ignore
  }
}
