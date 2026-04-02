// ============================================================
// controllers/merchantController.js — Lógica dos Comerciantes
// ============================================================

const Merchant = require("../models/Merchant");
const Transaction = require("../models/Transaction");
const { isValidCNPJ } = require("../utils/validators");

// ── POST /api/merchants/register ─────────────────────────────
// Cadastra um novo comerciante na plataforma
const register = async (req, res, next) => {
  try {
    const { businessName, email, cnpj, bankAccount, category } = req.body;

    // Valida os campos obrigatórios
    if (!businessName || !email || !cnpj || !bankAccount) {
      return res.status(400).json({
        error: "Campos obrigatórios: businessName, email, cnpj, bankAccount",
      });
    }

    // Valida os campos da conta bancária
    if (!bankAccount.bank || !bankAccount.agency || !bankAccount.accountNumber) {
      return res.status(400).json({
        error: "Dados bancários incompletos. Informe: bank, agency, accountNumber",
      });
    }

    // Valida o CNPJ com nosso validador
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    if (!isValidCNPJ(cleanCNPJ)) {
      return res.status(400).json({ error: "CNPJ inválido." });
    }

    const merchant = await Merchant.create({
      businessName,
      email,
      cnpj: cleanCNPJ,
      bankAccount,
      category: category || "other",
      // Status começa como "pending" — em produção passaria por uma análise de risco
      status: "pending",
    });

    res.status(201).json({
      message:
        "Comerciante cadastrado! Aguardando análise e aprovação da plataforma.",
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        email: merchant.email,
        status: merchant.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/merchants/:id ───────────────────────────────────
// Retorna dados públicos de um comerciante
const getById = async (req, res, next) => {
  try {
    const merchant = await Merchant.findById(req.params.id).select(
      "-bankAccount -cnpj" // Não expõe dados bancários e CNPJ completo publicamente
    );

    if (!merchant) {
      return res.status(404).json({ error: "Comerciante não encontrado." });
    }

    res.json({ merchant });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/merchants/:id/transactions ──────────────────────
// Histórico de transações do comerciante com paginação
const getTransactions = async (req, res, next) => {
  try {
    // Paginação via query params: /transactions?page=2&limit=20
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros opcionais
    const filter = { merchant: req.params.id };
    if (req.query.status) filter.status = req.query.status;

    // Busca as transações e conta o total (para paginação no frontend)
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("payer", "name email") // Substitui o ID pelo nome e email do pagador
        .sort({ createdAt: -1 }) // Mais recentes primeiro
        .skip(skip)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
        hasNextPage: page < Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/merchants/:id/approve ─────────────────────────
// Aprova um comerciante (simulando uma ação de admin)
// Em produção isso ficaria em uma área administrativa protegida
const approve = async (req, res, next) => {
  try {
    const merchant = await Merchant.findByIdAndUpdate(
      req.params.id,
      { status: "active" },
      { new: true }
    );

    if (!merchant) {
      return res.status(404).json({ error: "Comerciante não encontrado." });
    }

    res.json({
      message: "Comerciante aprovado com sucesso!",
      merchant: {
        id: merchant._id,
        businessName: merchant.businessName,
        status: merchant.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, getById, getTransactions, approve };
