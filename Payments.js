// ============================================================
// routes/payments.js — Rotas de Pagamento
// ============================================================
// Todas as rotas de pagamento requerem autenticação.
// Não faz sentido processar um pagamento sem saber quem está pagando.
// ============================================================

const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth"); // Todas as rotas aqui precisam de login

// Processar um novo pagamento
router.post("/charge", auth, paymentController.charge);

// Histórico de transações do usuário logado
// IMPORTANTE: /history deve vir ANTES de /:id para não confundir o Express
router.get("/history", auth, paymentController.getHistory);

// Detalhes de uma transação específica
router.get("/:id", auth, paymentController.getTransaction);

// Solicitar reembolso de uma transação
router.post("/refund/:id", auth, paymentController.refund);

module.exports = router;
