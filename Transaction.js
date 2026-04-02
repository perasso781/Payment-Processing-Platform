// ============================================================
// models/Transaction.js — Modelo de Transação
// ============================================================
// O registro de cada pagamento que acontece na plataforma.
// É o coração da aplicação — cada transação é imutável
// e serve como auditoria financeira.
// ============================================================

const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const transactionSchema = new mongoose.Schema(
  {
    // ID único legível para humanos (ex: mostrar na nota fiscal)
    // Gerado automaticamente com UUID para evitar colisões
    transactionId: {
      type: String,
      default: () => `TXN-${uuidv4().split("-")[0].toUpperCase()}`,
      unique: true,
      index: true, // Index para buscas rápidas por transactionId
    },

    // Quem pagou — referência ao documento User
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Quem recebeu — referência ao documento Merchant
    merchant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Merchant",
      required: true,
    },

    // Valor total cobrado do pagador (em centavos)
    amount: {
      type: Number,
      required: [true, "Valor da transação é obrigatório"],
      min: [100, "Valor mínimo é R$ 1,00 (100 centavos)"],
    },

    // Quanto a plataforma ficou de taxa (em centavos)
    platformFee: {
      type: Number,
      required: true,
      min: 0,
    },

    // Quanto o comerciante vai receber (amount - platformFee, em centavos)
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Método de pagamento utilizado
    paymentMethod: {
      type: String,
      enum: ["credit_card", "debit_card", "pix", "bank_transfer", "balance"],
      required: true,
    },

    // Status atual da transação — segue um fluxo linear
    // pending → processing → completed
    //                      ↘ failed
    // completed → refunded (se houver estorno)
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },

    // Descrição do que foi comprado — aparece no extrato
    description: {
      type: String,
      maxlength: [255, "Descrição muito longa"],
      default: "Pagamento processado pela plataforma",
    },

    // Dados do cartão — armazenamos só o suficiente para exibição
    // NUNCA armazenar o número completo do cartão sem tokenização!
    cardDetails: {
      lastFourDigits: {
        type: String,
        match: [/^\d{4}$/, "Deve conter exatamente 4 dígitos"],
      },
      brand: { type: String }, // Ex: "Visa", "Mastercard"
      holderName: { type: String },
    },

    // Histórico de mudanças de status — útil para auditoria e suporte
    // Ex: ["2024-01-15T10:00:00Z: pending", "2024-01-15T10:00:01Z: processing"]
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String, // Nota opcional (ex: "Aprovado pelo banco")
      },
    ],

    // ID da transação original, preenchido apenas em reembolsos
    refundOf: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },

    // Metadados extras que o comerciante pode passar (ex: ID do pedido deles)
    metadata: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ── Hook: ao criar a transação, registra o status inicial no histórico ──
transactionSchema.pre("save", function (next) {
  // Só adiciona ao histórico se o status mudou
  if (this.isModified("status")) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }
  next();
});

// ── Virtual: valor formatado em reais ────────────────────────
transactionSchema.virtual("amountInReais").get(function () {
  return `R$ ${(this.amount / 100).toFixed(2).replace(".", ",")}`;
});

// ── Índices compostos para queries comuns ────────────────────
// Buscar todas as transações de um pagador, ordenadas por data
transactionSchema.index({ payer: 1, createdAt: -1 });
// Buscar todas as transações de um comerciante, ordenadas por data
transactionSchema.index({ merchant: 1, createdAt: -1 });

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
