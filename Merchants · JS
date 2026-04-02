// ============================================================
// routes/merchants.js — Rotas de Comerciante
// ============================================================

const express = require("express");
const router = express.Router();

const merchantController = require("../controllers/merchantController");
const auth = require("../middleware/auth");

// Cadastro de comerciante é público (qualquer um pode se cadastrar)
router.post("/register", merchantController.register);

// Buscar dados de um comerciante é público (para o pagador ver pra quem está pagando)
router.get("/:id", merchantController.getById);

// Histórico de transações requer autenticação
// Em produção: só o próprio comerciante ou um admin poderia ver isso
router.get("/:id/transactions", auth, merchantController.getTransactions);

// Aprovação de comerciante — em produção seria uma rota de admin protegida
router.patch("/:id/approve", merchantController.approve);

module.exports = router;
