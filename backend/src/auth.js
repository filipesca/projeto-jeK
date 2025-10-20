// Autenticação usando JWT
import jwt from "jsonwebtoken";

// Gera token JWT com validade de 7 dias
export function generateToken(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

// Middleware para proteger rotas
export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
