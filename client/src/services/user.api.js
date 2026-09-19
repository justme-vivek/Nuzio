import { api } from './api.js';

export async function patchMe(payload) {
  const { data } = await api.patch('/users/me', payload);
  return data.user;
}

export async function getPreferences() {
  const { data } = await api.get('/preferences');
  return data.preferences;
}

export async function patchPreferences(payload) {
  const { data } = await api.patch('/preferences', payload);
  return data.preferences;
}

export async function getNotifications() {
  const { data } = await api.get('/notifications');
  return data; // { ok, unread, notifications }
}

export async function markNotificationRead(id) {
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
}

export async function markAllNotificationsRead() {
  const { data } = await api.patch('/notifications/read-all');
  return data;
}

export async function getSubscription() {
  const { data } = await api.get('/subscription');
  return data.subscription;
}
