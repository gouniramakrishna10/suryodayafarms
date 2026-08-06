/**
 * Lightweight In-Memory API Cache Store for Suryodaya Farms
 * Eliminates duplicate network requests and enables instant route transitions.
 */

const cacheMap = new Map();
const DEFAULT_TTL_MS = 2 * 60 * 1000; // 2 minutes default cache TTL

export const getCachedData = (key) => {
  const cached = cacheMap.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiry) {
    cacheMap.delete(key);
    return null;
  }
  return cached.data;
};

export const setCachedData = (key, data, ttlMs = DEFAULT_TTL_MS) => {
  cacheMap.set(key, {
    data,
    expiry: Date.now() + ttlMs
  });
};

export const clearCache = (keyPattern) => {
  if (!keyPattern) {
    cacheMap.clear();
    return;
  }
  for (const key of cacheMap.keys()) {
    if (key.includes(keyPattern)) {
      cacheMap.delete(key);
    }
  }
};

export const fetchWithCache = async (key, fetchFn, ttlMs = DEFAULT_TTL_MS) => {
  const cached = getCachedData(key);
  if (cached) {
    return cached;
  }
  const freshData = await fetchFn();
  setCachedData(key, freshData, ttlMs);
  return freshData;
};
