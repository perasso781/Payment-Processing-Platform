// ============================================================
// routes/users.js — Rotas de Usuário
// ============================================================
// Aqui apenas definimos as rotas e conectamos com os controllers.
// A lógica de negócio fica no controller, não aqui.
// ============================================================

const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Rotas públicas (não precisam de token)
router.post("/register", userController.register);
router.post("/login", userController.login);

// Rotas privadas (precisam de token JWT — o middleware auth verifica)
router.get("/me", auth, userController.getMe);
router.patch("/deposit", auth, userController.deposit);

module.exports = router;
