// ============================================================
// models/User.js — Modelo de Usuário
// ============================================================
// Representa quem faz os pagamentos na plataforma.
// O Mongoose usa esse schema para validar e salvar dados
// no MongoDB automaticamente.
// ============================================================

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Nome é obrigatório"],
      trim: true, // Remove espaços em branco do início e fim
      minlength: [2, "Nome deve ter pelo menos 2 caracteres"],
      maxlength: [100, "Nome deve ter no máximo 100 caracteres"],
    },

    email: {
      type: String,
      required: [true, "Email é obrigatório"],
      unique: true, // Não permite dois usuários com o mesmo email
      lowercase: true, // Salva sempre em minúsculo
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Formato de email inválido"],
    },

    password: {
      type: String,
      required: [true, "Senha é obrigatória"],
      minlength: [6, "Senha deve ter pelo menos 6 caracteres"],
      select: false, // Quando buscar um usuário, a senha NÃO vem por padrão
    },

    // CPF armazenado sem formatação (só números) para facilitar buscas
    cpf: {
      type: String,
      required: [true, "CPF é obrigatório"],
      unique: true,
      match: [/^\d{11}$/, "CPF deve conter exatamente 11 dígitos"],
    },

    // Saldo virtual do usuário na plataforma (em centavos para evitar problemas com float)
    // Ex: R$ 10,50 = 1050 centavos
    balance: {
      type: Number,
      default: 0,
      min: [0, "Saldo não pode ser negativo"],
    },

    // Status da conta - útil para bloquear usuários suspeitos sem deletar os dados
    status: {
      type: String,
      enum: ["active", "suspended", "pending"],
      default: "active",
    },
  },
  {
    // timestamps: true faz o Mongoose criar automaticamente os campos
    // createdAt e updatedAt em cada documento
    timestamps: true,
  }
);

// ── Hook: antes de salvar, faz o hash da senha ───────────────
// Isso roda automaticamente sempre que um usuário é criado ou sua senha é alterada.
// Nunca devemos salvar a senha em texto puro no banco!
userSchema.pre("save", async function (next) {
  // Se a senha não foi modificada, não precisa fazer hash de novo
  if (!this.isModified("password")) return next();

  // O número 12 é o "salt rounds" - quanto maior, mais seguro (e mais lento)
  // 12 é um bom equilíbrio para produção
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Método: verificar se a senha informada está correta ──────
// Usando método no schema para manter essa lógica perto do modelo
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Método: formatar saldo para reais ───────────────────────
userSchema.methods.getFormattedBalance = function () {
  return (this.balance / 100).toFixed(2); // Converte centavos para reais
};

const User = mongoose.model("User", userSchema);

module.exports = User;
