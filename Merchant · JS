// ============================================================
// models/Merchant.js — Modelo de Comerciante
// ============================================================
// Representa as empresas ou pessoas que RECEBEM pagamentos.
// Ex: uma loja virtual, um prestador de serviços, etc.
// ============================================================

const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema(
  {
    // Nome fantasia da empresa
    businessName: {
      type: String,
      required: [true, "Nome da empresa é obrigatório"],
      trim: true,
      maxlength: [150, "Nome da empresa muito longo"],
    },

    // Email de contato do negócio (separado do email de login do dono)
    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    // CNPJ sem formatação (só 14 números)
    cnpj: {
      type: String,
      required: [true, "CNPJ é obrigatório"],
      unique: true,
      match: [/^\d{14}$/, "CNPJ deve conter exatamente 14 dígitos"],
    },

    // Dados bancários para repasse dos valores recebidos
    bankAccount: {
      bank: { type: String, required: true },        // Ex: "Bradesco", "Itaú"
      agency: { type: String, required: true },       // Agência
      accountNumber: { type: String, required: true }, // Número da conta
      accountType: {
        type: String,
        enum: ["checking", "savings"], // checking = corrente, savings = poupança
        default: "checking",
      },
    },

    // Taxa de processamento específica deste comerciante (em %)
    // Se não definida, usa a taxa padrão da plataforma (do .env)
    customFeePercent: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },

    // Saldo disponível para saque (em centavos)
    availableBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Saldo ainda em processamento/período de retenção (em centavos)
    pendingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Status do comerciante
    // pending = aguardando aprovação, active = pode receber pagamentos
    // suspended = bloqueado por algum motivo
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },

    // Categoria do negócio - útil para análise de risco e relatórios
    category: {
      type: String,
      enum: [
        "retail",       // Varejo
        "food",         // Alimentação
        "services",     // Serviços
        "tech",         // Tecnologia
        "health",       // Saúde
        "education",    // Educação
        "other",        // Outros
      ],
      default: "other",
    },
  },
  {
    timestamps: true,
    // Adiciona um campo virtual 'id' que é string do _id
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── Virtual: total de saldo (disponível + pendente) ──────────
// Campos virtuais não são salvos no banco, são calculados na hora
merchantSchema.virtual("totalBalance").get(function () {
  return this.availableBalance + this.pendingBalance;
});

// ── Método: calcular a taxa deste comerciante ────────────────
merchantSchema.methods.getFeePercent = function () {
  // Se o comerciante tem uma taxa personalizada, usa ela
  // Caso contrário, usa a taxa padrão definida no .env
  return this.customFeePercent ?? parseFloat(process.env.PLATFORM_FEE_PERCENT) ?? 2.5;
};

const Merchant = mongoose.model("Merchant", merchantSchema);

module.exports = Merchant;
