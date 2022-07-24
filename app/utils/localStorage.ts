/**
 * Save cached data in LocalStorage
 * @param key
 * @param value
 */
export function setCache(key: string, value: any) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Get cached data from LocalStorage
 * @param key
 * @returns
 */
export function getCache(key: string): any {
  if (typeof window !== 'undefined') {
    let data = window.localStorage.getItem(key);

    if (data !== null) {
      data = JSON.parse(data);
      return data;
    }
  }

  return [];
}
