/**
 * @param {RequestInfo | URL} input
 * @param {RequestInit} [init]
 */
export function adminFetch(input, init = {}) {
  const token = localStorage.getItem("token");
  const headers = new Headers(init.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
