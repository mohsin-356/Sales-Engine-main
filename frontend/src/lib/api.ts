const runtimeOverride = typeof window !== 'undefined' ? (window as any).__API_BASE_URL : undefined;
const BASE_URL: string =
  (import.meta as any)?.env?.VITE_API_BASE_URL ||
  runtimeOverride ||
  '/api';

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.status === 204 ? null : res.json();
}

export const api = {
  get: (path: string) => request(path),
  post: (path: string, body?: any) => request(path, { method: 'POST', body: JSON.stringify(body || {}) }),
  put: (path: string, body?: any) => request(path, { method: 'PUT', body: JSON.stringify(body || {}) }),
  delete: (path: string) => request(path, { method: 'DELETE' }),
};

export default api;
