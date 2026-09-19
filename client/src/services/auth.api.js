import { api } from './api.js';

export async function loginWithGoogle(credential) {
  const { data } = await api.post('/auth/google', { credential });
  return data; // { ok, user }
}

export async function logout() {
  const { data } = await api.post('/auth/logout');
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data; // { ok, user, preferences }
}
