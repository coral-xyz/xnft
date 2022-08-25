import fetch from 'isomorphic-unfetch';

/**
 * Custom HTTP `fetch` function with built in abort signals for desired timeouts.
 * @export
 * @param {string} uri
 * @param {RequestInit} [opts]
 * @param {number} [timeout]
 * @returns {Promise<Response>}
 */
export default function (uri: string, opts?: RequestInit, timeout?: number): Promise<Response> {
  let controller: AbortController | undefined = undefined;
  let signal: AbortSignal | undefined = undefined;

  if (timeout !== undefined) {
    controller = new AbortController();
    signal = controller.signal;
    setTimeout(() => controller.abort(), timeout);
  }

  return fetch(uri, { ...opts, signal });
}
