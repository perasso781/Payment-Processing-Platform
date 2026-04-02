// ============================================================
// controllers/paymentController.js — Lógica de Pagamentos
// ============================================================
// Aqui está o coração da plataforma. Todo o fluxo de
// processamento de um pagamento acontece neste controller.
//
// Fluxo de um pagamento:
// 1. Validar os dados recebidos
// 2. Verificar se o comerciante pode receber pagamentos
// 3. Verificar se o pagador tem saldo/cartão válido
// 4. Criar a transação com status "pending"
// 5. Processar o pagamento (simulado aqui)
// 6. Atualizar saldos e status da transação
// ============================================================

const Transaction = require("../models/Transaction");
const User = require("../models/User");
const Merchant = require("../models/Merchant");
const {
  isValidCardNumber,
  getCardBrand,
  isValidCVV,
  isValidExpiryDate,
  validateAmount,
} = require("../utils/validators");
const { maskSensitiveData } = require("../utils/encryption");

// ── POST /api/payments/charge ────────────────────────────────
// Processa um novo pagamento
const charge = async (req, res, next) => {
  try {
    const {
      merchantId,
      amountInCents,
      paymentMethod,
      description,
      cardDetails, // Só obrigatório se paymentMethod for crédito/débito
      metadata,
    } = req.body;

    // ── 1. Validar os dados da requisição ────────────────────

    if (!merchantId || !amountInCents || !paymentMethod) {
      return res.status(400).json({
        error: "Campos obrigatórios: merchantId, amountInCents, paymentMethod",
      });
    }

    const amountValidation = validateAmount(amountInCents);
    if (!amountValidation.valid) {
      return res.status(400).json({ error: amountValidation.message });
    }

    const validMethods = ["credit_card", "debit_card", "pix", "bank_transfer", "balance"];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        error: `Método de pagamento inválido. Use: ${validMethods.join(", ")}`,
      });
    }

    // ── 2. Verificar o comerciante ───────────────────────────

    const merchant = await Merchant.findById(merchantId);
    if (!merchant) {
      return res.status(404).json({ error: "Comerciante não encontrado." });
    }

    if (merchant.status !== "active") {
      return res.status(403).json({
        error: "Este comerciante não está ativo para receber pagamentos.",
      });
    }

    // ── 3. Validar método de pagamento ───────────────────────

    let cardInfo = {};

    if (paymentMethod === "credit_card" || paymentMethod === "debit_card") {
      if (!cardDetails) {
        return res.status(400).json({
          error: "Dados do cartão são obrigatórios para pagamento com cartão.",
        });
      }

      const { number, cvv, expiryMonth, expiryYear, holderName } = cardDetails;

      if (!isValidCardNumber(number)) {
        return res.status(400).json({ error: "Número de cartão inválido." });
      }

      const brand = getCardBrand(number);

      if (!isValidCVV(cvv, brand)) {
        return res.status(400).json({ error: "CVV inválido." });
      }

      if (!isValidExpiryDate(expiryMonth, expiryYear)) {
        return res.status(400).json({ error: "Cartão vencido ou data inválida." });
      }

      // Guardamos só os últimos 4 dígitos e a bandeira
      // NUNCA armazenar o número completo sem tokenização de um gateway real!
      cardInfo = {
        lastFourDigits: number.replace(/\D/g, "").slice(-4),
        brand,
        holderName: holderName || "",
      };
    }

    if (paymentMethod === "balance") {
      // Pagamento com saldo da carteira virtual
      const user = await User.findById(req.user._id);
      if (user.balance < amountInCents) {
        return res.status(400).json({
          error: `Saldo insuficiente. Seu saldo: R$ ${user.getFormattedBalance()}`,
        });
      }
    }

    // ── 4. Calcular taxas ────────────────────────────────────

    const feePercent = merchant.getFeePercent();
    const platformFee = Math.round(amountInCents * (feePercent / 100));
    const netAmount = amountInCents - platformFee; // O que o comerciante recebe

    // ── 5. Criar a transação no banco ────────────────────────

    const transaction = await Transaction.create({
      payer: req.user._id,
      merchant: merchant._id,
      amount: amountInCents,
      platformFee,
      netAmount,
      paymentMethod,
      description: description || "Pagamento processado",
      status: "pending",
      cardDetails: cardInfo,
      metadata: metadata || {},
    });

    // ── 6. Simular o processamento do pagamento ──────────────
    // Em produção: aqui chamaria a API do gateway (Stripe, Cielo, etc.)
    // Por agora, simulamos 95% de aprovação e 5% de falha aleatória

    const isApproved = Math.random() > 0.05;

    if (isApproved) {
      // Atualiza saldos e status atomicamente usando sessão do MongoDB
      // Sessões garantem que todas as operações abaixo acontecem juntas
      // Se uma falhar, todas são revertidas (ACID)
      const session = await Transaction.startSession();
      session.startTransaction();

      try {
        // Debita do usuário (se pagou com saldo)
        if (paymentMethod === "balance") {
          await User.findByIdAndUpdate(
            req.user._id,
            { $inc: { balance: -amountInCents } },
            { session }
          );
        }

        // Credita no saldo pendente do comerciante (ainda não disponível para saque)
        await Merchant.findByIdAndUpdate(
          merchant._id,
          { $inc: { pendingBalance: netAmount } },
          { session }
        );

        // Atualiza o status da transação para "completed"
        await Transaction.findByIdAndUpdate(
          transaction._id,
          {
            status: "completed",
            $push: {
              statusHistory: { status: "completed", note: "Aprovado pelo banco" },
            },
          },
          { session }
        );

        await session.commitTransaction();
        session.endSession();

        return res.status(201).json({
          message: "Pagamento aprovado!",
          transaction: {
            id: transaction.transactionId,
            status: "completed",
            amount: `R$ ${(amountInCents / 100).toFixed(2)}`,
            merchant: merchant.businessName,
            paymentMethod,
            ...(cardInfo.lastFourDigits && {
              card: `${cardInfo.brand} **** ${cardInfo.lastFourDigits}`,
            }),
            platformFee: `R$ ${(platformFee / 100).toFixed(2)}`,
            createdAt: transaction.createdAt,
          },
        });
      } catch (sessionError) {
        await session.abortTransaction();
        session.endSession();
        throw sessionError; // Repassa o erro para o errorHandler
      }
    } else {
      // Pagamento recusado
      await Transaction.findByIdAndUpdate(transaction._id, {
        status: "failed",
        $push: {
          statusHistory: { status: "failed", note: "Recusado pelo banco emissor" },
        },
      });

      return res.status(402).json({
        error: "Pagamento recusado pelo banco. Tente outro método de pagamento.",
        transactionId: transaction.transactionId,
      });
    }
  } catch (error) {
    next(error);
  }
};

// ── POST /api/payments/refund/:id ────────────────────────────
// Solicita o reembolso de uma transação
const refund = async (req, res, next) => {
  try {
    const { reason } = req.body;

    // Busca a transação original
    const originalTransaction = await Transaction.findOne({
      transactionId: req.params.id,
      payer: req.user._id, // Garante que só o dono pode pedir reembolso
    });

    if (!originalTransaction) {
      return res.status(404).json({ error: "Transação não encontrada." });
    }

    if (originalTransaction.status !== "completed") {
      return res.status(400).json({
        error: "Só é possível reembolsar transações com status 'completed'.",
      });
    }

    // Verifica se já existe um reembolso para essa transação
    const existingRefund = await Transaction.findOne({
      refundOf: originalTransaction._id,
    });

    if (existingRefund) {
      return res.status(400).json({
        error: "Esta transação já foi reembolsada.",
      });
    }

    // Cria uma transação de reembolso (valor negativo do ponto de vista do comerciante)
    const refundTransaction = await Transaction.create({
      payer: req.user._id,
      merchant: originalTransaction.merchant,
      amount: originalTransaction.amount,
      platformFee: 0, // Reembolsos não cobram taxa
      netAmount: originalTransaction.amount,
      paymentMethod: originalTransaction.paymentMethod,
      description: `Reembolso: ${reason || "Solicitado pelo usuário"}`,
      status: "completed",
      refundOf: originalTransaction._id,
    });

    // Atualiza a transação original para "refunded"
    await Transaction.findByIdAndUpdate(originalTransaction._id, {
      status: "refunded",
      $push: { statusHistory: { status: "refunded", note: reason || "Reembolso solicitado" } },
    });

    // Devolve o dinheiro para o usuário se o pagamento foi feito via saldo
    if (originalTransaction.paymentMethod === "balance") {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { balance: originalTransaction.amount },
      });
    }

    // Desconta do saldo do comerciante
    await Merchant.findByIdAndUpdate(originalTransaction.merchant, {
      $inc: { availableBalance: -originalTransaction.netAmount },
    });

    res.json({
      message: "Reembolso processado com sucesso!",
      refund: {
        id: refundTransaction.transactionId,
        amount: `R$ ${(refundTransaction.amount / 100).toFixed(2)}`,
        originalTransactionId: originalTransaction.transactionId,
        status: "completed",
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/payments/:id ────────────────────────────────────
// Retorna os detalhes de uma transação específica
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      transactionId: req.params.id,
    })
      .populate("payer", "name email")
      .populate("merchant", "businessName email");

    if (!transaction) {
      return res.status(404).json({ error: "Transação não encontrada." });
    }

    // Verifica se o usuário logado tem direito de ver essa transação
    const isOwner = transaction.payer._id.toString() === req.user._id.toString();
    if (!isOwner) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    res.json({ transaction });
  } catch (error) {
    next(error);
  }
};

// ── GET /api/payments/history ────────────────────────────────
// Histórico de transações do usuário logado com filtros e paginação
const getHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { payer: req.user._id };

    // Filtro por status: /history?status=completed
    if (req.query.status) filter.status = req.query.status;

    // Filtro por método: /history?method=pix
    if (req.query.method) filter.paymentMethod = req.query.method;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate("merchant", "businessName")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-statusHistory -metadata"), // Remove campos desnecessários na listagem
      Transaction.countDocuments(filter),
    ]);

    res.json({
      transactions,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalTransactions: total,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { charge, refund, getTransaction, getHistory };
