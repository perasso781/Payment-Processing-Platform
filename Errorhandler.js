// ============================================================
// middleware/errorHandler.js — Handler Global de Erros
// ============================================================
// Em vez de tratar erros em cada controller separadamente,
// centralizamos tudo aqui. Os controllers usam next(error)
// para jogar o erro pra cá, e a gente formata a resposta.
//
// Isso garante que todos os erros tenham o mesmo formato
// e que logs sejam feitos de forma consistente.
// ============================================================

const errorHandler = (err, req, res, next) => {
  // Imprime o erro no servidor para debugging
  // Em produção, isso iria para um sistema de logs como Winston + Sentry
  console.error(`[ERRO] ${req.method} ${req.path}:`, err.message);

  // Valor padrão — vai ser sobrescrito pelos casos específicos abaixo
  let statusCode = err.statusCode || 500;
  let message = err.message || "Erro interno do servidor";

  // ── Erros do Mongoose ────────────────────────────────────

  // Erro de validação (ex: campo obrigatório faltando)
  if (err.name === "ValidationError") {
    statusCode = 400;
    // O Mongoose agrupa os erros de validação num objeto
    // Aqui pegamos só as mensagens e juntamos com vírgula
    const errors = Object.values(err.errors).map((e) => e.message);
    message = errors.join(", ");
  }

  // Erro de chave duplicada (ex: email já cadastrado)
  // O código 11000 é o código do MongoDB para duplicate key
  if (err.code === 11000) {
    statusCode = 409; // 409 Conflict
    const field = Object.keys(err.keyValue)[0]; // qual campo causou o conflito
    message = `Já existe um cadastro com este ${field}.`;
  }

  // ID inválido (ObjectId do MongoDB mal formatado)
  if (err.name === "CastError" && err.kind === "ObjectId") {
    statusCode = 400;
    message = "ID inválido.";
  }

  // ── Resposta para o cliente ──────────────────────────────
  res.status(statusCode).json({
    error: message,
    // Em desenvolvimento, retorna o stack trace para facilitar debug
    // Em produção NUNCA exponha isso — revela a estrutura interna do sistema
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
