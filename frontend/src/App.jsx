// Layout principal e definicao de rotas.
// Rotas: Home (cliente), Admin (login) e Dashboard (protegida)
import React from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminLogin from "./pages/AdminLogin";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div className="min-h-screen">
      {/* Header com navegacao */}
      <header className="bg-white border-b sticky top-0 z-10">
        <nav className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">
            Couraça - Reservas
          </Link>
          <div className="flex gap-4 text-sm">
            <Link to="/">Cliente</Link>
            <Link to="/admin">Admin/Staff</Link>
          </div>
        </nav>
      </header>

      {/* Area de conteudo trocada pelas rotas */}
      <main className="max-w-4xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Rota fallback: redireciona para Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
