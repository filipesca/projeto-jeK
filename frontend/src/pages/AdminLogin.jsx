// Pagina de login para admin
import React, { useState } from "react";
import { login, setToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("1234");
  const [status, setStatus] = useState(null);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setStatus("Entrando...");
    try {
      const { token } = await login(username, password);
      setToken(token); // Guarda o token
      nav("/dashboard"); // Redireciona para o dashboard
    } catch (e) {
      setStatus("Utilizador ou senha incorretos");
    }
  }

  return (
    <div className="max-w-sm">
      <h1 className="text-xl font-semibold mb-3">Admin</h1>
      <form
        onSubmit={onSubmit}
        className="bg-white shadow p-4 rounded-xl grid gap-3"
      >
        <input
          className="border rounded p-2"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Utilizador"
        />
        <input
          className="border rounded p-2"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Senha"
        />
        <button className="bg-black text-white rounded-lg px-4 py-2">
          Entrar
        </button>
        {status && <p className="text-sm text-gray-600">{status}</p>}
      </form>
    </div>
  );
}
