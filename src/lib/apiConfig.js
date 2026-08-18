const LOCAL_DEVELOPMENT_API_URL = "http://localhost:5000";

const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();

export const API_BASE_URL = (
  configuredApiUrl || LOCAL_DEVELOPMENT_API_URL
).replace(/\/+$/, "");

const isAbsoluteUrl = (value) =>
  /^(?:[a-z][a-z\d+.-]*:)?\/\//i.test(value) ||
  /^(?:data|blob):/i.test(value);

export function apiUrl(path = "") {
  if (isAbsoluteUrl(path)) return path;
  return `${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
}

export function assetUrl(path) {
  if (typeof path !== "string" || !path) return path;
  if (isAbsoluteUrl(path)) return path;
  return path.startsWith("/uploads/") ? apiUrl(path) : path;
}
