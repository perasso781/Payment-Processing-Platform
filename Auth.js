// ============================================================
// middleware/auth.js — Verificação de Autenticação (JWT)
// ============================================================
// Esse middleware protege as rotas que precisam de login.
// Ele lê o token JWT do header da requisição, verifica se
// é válido e injeta os dados do usuário no req para usar
// nos controllers.
//
// Uso: adicione `auth` antes do controller na rota
// Ex: router.get("/me", auth, userController.getMe)
// ============================================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    // O token deve vir no header "Authorization" no formato:
    // Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Acesso negado. Token não fornecido.",
      });
    }

    // Pega só a parte do token, removendo o "Bearer "
    const token = authHeader.split(" ")[1];

    // Verifica se o token é válido e não expirou
    // Se for inválido, o jwt.verify() lança uma exceção automaticamente
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Busca o usuário no banco para garantir que ele ainda existe e está ativo
    // select("+password") não é usado aqui porque não precisamos da senha
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        error: "Token inválido. Usuário não encontrado.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        error: "Conta suspensa ou inativa. Entre em contato com o suporte.",
      });
    }

    // Injeta o usuário no req para usar nos controllers seguintes
    req.user = user;

    next(); // Tudo certo, pode prosseguir para o controller
  } catch (error) {
    // O JWT lança erros específicos que podemos tratar melhor
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Token inválido." });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Token expirado. Faça login novamente.",
      });
    }

    // Qualquer outro erro inesperado
    next(error);
  }
};

module.exports = auth;
