/**
 * @param {string} key
 * @param {any} value
 */
export function setCache(key: string, value: any) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * @param {string} key
 * @returns {any}
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
