import { api } from "./api.js";

export async function loginWithGoogle(credential) {
  const { data } = await api.post("/auth/google", { credential });
  if (data.token) localStorage.setItem("nuzio_token", data.token);
  return data; // { ok, user }
}

export async function logout() {
  try {
    const { data } = await api.post("/auth/logout");
    return data;
  } finally {
    localStorage.removeItem("nuzio_token");
  }
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data; // { ok, user, preferences }
}
