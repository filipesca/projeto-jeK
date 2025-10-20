// Protege o Dashboard
import React from "react";
import { Navigate } from "react-router-dom";
import { getToken } from "../api";

export default function ProtectedRoute({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/admin" replace />;
  return children;
}
