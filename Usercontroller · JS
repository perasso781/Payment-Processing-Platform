// ============================================================
// controllers/userController.js — Lógica dos Usuários
// ============================================================
// Os controllers são responsáveis pela lógica de negócio.
// Eles recebem o req (requisição), fazem o que precisa ser feito
// e enviam a resposta com res.
// Erros são passados para o errorHandler via next(error).
// ============================================================

const User = require("../models/User");
const { generateToken } = require("../utils/encryption");
const { isValidCPF } = require("../utils/validators");

// ── POST /api/users/register ─────────────────────────────────
// Cria uma nova conta de usuário
const register = async (req, res, next) => {
  try {
    const { name, email, password, cpf } = req.body;

    // Validações manuais que o Mongoose não cobre
    if (!name || !email || !password || !cpf) {
      return res.status(400).json({
        error: "Todos os campos são obrigatórios: name, email, password, cpf",
      });
    }

    // Limpa o CPF e valida usando nosso validador personalizado
    const cleanCPF = cpf.replace(/\D/g, "");
    if (!isValidCPF(cleanCPF)) {
      return res.status(400).json({ error: "CPF inválido." });
    }

    // Cria o usuário — o hook pre('save') no modelo vai fazer o hash da senha
    const user = await User.create({
      name,
      email,
      password,
      cpf: cleanCPF,
    });

    // Gera o token JWT para o usuário já ficar logado após o cadastro
    const token = generateToken(user._id);

    // Retorna 201 (Created) com os dados do usuário e o token
    // Não retornamos a senha, mesmo que já esteja em hash
    res.status(201).json({
      message: "Conta criada com sucesso!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.getFormattedBalance(),
      },
    });
  } catch (error) {
    next(error); // Passa pro errorHandler tratar (ex: email duplicado)
  }
};

// ── POST /api/users/login ────────────────────────────────────
// Autentica o usuário e retorna um JWT
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    // Busca o usuário pelo email E inclui a senha (que vem oculta por padrão)
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      // Mensagem genérica de propósito — não diz se o email existe ou não
      // Isso evita que alguém use a API para descobrir emails cadastrados
      return res.status(401).json({ error: "Email ou senha incorretos." });
    }

    // Usa o método do modelo para comparar as senhas (bcrypt.compare por baixo)
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Email ou senha incorretos." });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        error: "Conta suspensa. Entre em contato com o suporte.",
      });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login realizado com sucesso!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        balance: user.getFormattedBalance(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/users/me ────────────────────────────────────────
// Retorna os dados do usuário logado (requer autenticação)
const getMe = async (req, res, next) => {
  try {
    // req.user foi injetado pelo middleware auth.js
    const user = req.user;

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        cpf: `***.***.${user.cpf.slice(6, 9)}-${user.cpf.slice(9)}`, // Mascara o CPF
        balance: user.getFormattedBalance(),
        status: user.status,
        memberSince: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── PATCH /api/users/deposit ─────────────────────────────────
// Adiciona saldo à conta do usuário (simulação de depósito)
const deposit = async (req, res, next) => {
  try {
    const { amountInCents } = req.body;

    if (!amountInCents || amountInCents < 100) {
      return res.status(400).json({
        error: "Valor mínimo de depósito é R$ 1,00 (100 centavos).",
      });
    }

    // $inc faz a operação atomicamente no banco — sem risco de race condition
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { balance: amountInCents } },
      { new: true } // Retorna o documento atualizado
    );

    res.json({
      message: "Depósito realizado com sucesso!",
      depositedAmount: `R$ ${(amountInCents / 100).toFixed(2)}`,
      newBalance: user.getFormattedBalance(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, deposit };
