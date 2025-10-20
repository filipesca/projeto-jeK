// Wrapper de chamadas ao backend. Centraliza URLs, headers e trata de erros
export const API = "http://localhost:4000/api";

// Auth
export const setToken = (t) => localStorage.setItem("token", t);
export const getToken = () => localStorage.getItem("token");
export async function login(username, password) {
  const r = await fetch(`${API}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!r.ok) throw new Error("Login falhou");
  return r.json();
}

// Reservas (cliente)
export async function createReservation(d) {
  const r = await fetch(`${API}/reservations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(d),
  });
  if (!r.ok) throw new Error((await r.json()).error || "Erro ao reservar");
  return r.json();
}

// Lista mesas livres para um determinado dia e hora
export async function getAvailableTables(datetime) {
  const url = new URL(`${API}/available-tables`);
  url.searchParams.set("datetime", datetime);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erro ao carregar mesas disponíveis");
  const data = await res.json();
  return data.available || [];
}

// Funcoes admin

export async function listReservations() {
  const t = getToken();
  const r = await fetch(`${API}/reservations`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!r.ok) throw new Error("Não autorizado");
  return r.json();
}
export async function deleteReservation(id) {
  const t = getToken();
  const r = await fetch(`${API}/reservations/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!r.ok) throw new Error("Erro ao cancelar");
  return r.json();
}
export async function getSummary(date) {
  const t = getToken();
  const u = new URL(`${API}/summary`);
  u.searchParams.set("date", date);
  const r = await fetch(u, { headers: { Authorization: `Bearer ${t}` } });
  if (!r.ok) throw new Error("Erro no resumo");
  return r.json();
}
export async function getSettings() {
  const t = getToken();
  const r = await fetch(`${API}/settings`, {
    headers: { Authorization: `Bearer ${t}` },
  });
  if (!r.ok) throw new Error("Erro ao carregar settings");
  return r.json();
}
export async function setSettings(total_tables) {
  const t = getToken();
  const r = await fetch(`${API}/settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${t}`,
    },
    body: JSON.stringify({ total_tables }),
  });
  if (!r.ok) throw new Error("Erro ao salvar settings");
  return r.json();
}
