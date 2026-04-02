// ============================================================
// server.js — Ponto de entrada da aplicação
// ============================================================
// Aqui é onde tudo começa. Configuramos o Express, conectamos
// ao banco de dados e registramos todas as rotas da API.
// ============================================================

require("dotenv").config(); // Carrega o arquivo .env antes de qualquer coisa

const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/database");
const errorHandler = require("./middleware/errorHandler");

// Importando as rotas
const userRoutes = require("./routes/users");
const merchantRoutes = require("./routes/merchants");
const paymentRoutes = require("./routes/payments");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Conectar ao banco de dados ───────────────────────────────
connectDB();

// ── Middlewares de segurança ─────────────────────────────────

// Helmet adiciona headers HTTP de segurança automaticamente
// (ex: evita clickjacking, XSS via headers, etc.)
app.use(helmet());

// CORS - define quais origens podem acessar a API
// Em produção, troque "*" pelo domínio do seu frontend
app.use(cors({ origin: "*" }));

// Limita cada IP a 100 requisições por 15 minutos
// Isso ajuda a proteger contra ataques de força bruta e DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: {
    error: "Muitas requisições deste IP. Tente novamente em 15 minutos.",
  },
});
app.use(limiter);

// Permite que o Express leia o corpo das requisições em JSON
app.use(express.json());

// ── Rotas da API ─────────────────────────────────────────────
app.use("/api/users", userRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/payments", paymentRoutes);

// Rota de health check - útil para verificar se a API está no ar
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Payment Platform rodando normalmente",
    timestamp: new Date().toISOString(),
  });
});

// Rota para qualquer caminho que não existe
app.use("*", (req, res) => {
  res.status(404).json({ error: "Rota não encontrada" });
});

// ── Middleware de erros ──────────────────────────────────────
// IMPORTANTE: esse middleware precisa ser o último!
// O Express identifica um handler de erros pelos 4 parâmetros (err, req, res, next)
app.use(errorHandler);

// ── Iniciar o servidor ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Ambiente: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 http://localhost:${PORT}\n`);
});

module.exports = app; // Exportado para facilitar os testes
