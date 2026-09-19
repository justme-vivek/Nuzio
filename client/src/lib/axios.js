import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 30_000,
});

// Session expiry -> broadcast so AuthContext can reset to guest.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const url = String(err?.config?.url || '');
    if (status === 401 && !url.includes('/auth/')) {
      window.dispatchEvent(new Event('nuzio:unauthorized'));
    }
    return Promise.reject(err);
  }
);

export function apiErrorMessage(err, fallback = 'Something went wrong') {
  return err?.response?.data?.error || err?.message || fallback;
}

export default api;
