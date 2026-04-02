// ============================================================
// utils/validators.js — Funções de Validação
// ============================================================
// Funções puras de validação que podemos usar em qualquer
// parte do código. Separar validações aqui evita duplicação
// e facilita testes unitários.
// ============================================================

/**
 * Valida um CPF brasileiro usando o algoritmo oficial.
 * Verifica os dois dígitos verificadores.
 *
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean}
 */
const isValidCPF = (cpf) => {
  // Remove tudo que não for número
  const cleaned = cpf.replace(/\D/g, "");

  if (cleaned.length !== 11) return false;

  // CPFs com todos os dígitos iguais são inválidos (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Cálculo do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[9])) return false;

  // Cálculo do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned[10])) return false;

  return true;
};

/**
 * Valida um CNPJ brasileiro usando o algoritmo oficial.
 *
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean}
 */
const isValidCNPJ = (cnpj) => {
  const cleaned = cnpj.replace(/\D/g, "");

  if (cleaned.length !== 14) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  // Cálculo dos dois dígitos verificadores do CNPJ
  const calcDigit = (cnpjStr, length) => {
    const weights = length === 12
      ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
      : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < length; i++) {
      sum += parseInt(cnpjStr[i]) * weights[i];
    }

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  if (calcDigit(cleaned, 12) !== parseInt(cleaned[12])) return false;
  if (calcDigit(cleaned, 13) !== parseInt(cleaned[13])) return false;

  return true;
};

/**
 * Valida um número de cartão de crédito usando o algoritmo de Luhn.
 * Esse é o algoritmo usado mundialmente para validação de cartões.
 *
 * @param {string} cardNumber - Número do cartão (com ou sem espaços/hífens)
 * @returns {boolean}
 */
const isValidCardNumber = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, "");

  if (cleaned.length < 13 || cleaned.length > 19) return false;

  // Algoritmo de Luhn
  let sum = 0;
  let shouldDouble = false;

  // Percorre da direita para a esquerda
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

/**
 * Identifica a bandeira do cartão pelos primeiros dígitos.
 *
 * @param {string} cardNumber
 * @returns {string} - "Visa", "Mastercard", etc. ou "Unknown"
 */
const getCardBrand = (cardNumber) => {
  const cleaned = cardNumber.replace(/\D/g, "");

  if (/^4/.test(cleaned)) return "Visa";
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return "Mastercard";
  if (/^3[47]/.test(cleaned)) return "American Express";
  if (/^6(?:011|5)/.test(cleaned)) return "Discover";
  if (/^(?:2131|1800|35)/.test(cleaned)) return "JCB";
  if (/^36/.test(cleaned)) return "Diners Club";
  if (/^(?:606282|3841)/.test(cleaned)) return "Hipercard";
  if (/^(?:4011|4312|4389|4514|4576|5041|5066|5090|6277|6362)/.test(cleaned)) return "Elo";

  return "Unknown";
};

/**
 * Valida o CVV do cartão (3 ou 4 dígitos, dependendo da bandeira).
 *
 * @param {string} cvv
 * @param {string} brand - Bandeira do cartão
 * @returns {boolean}
 */
const isValidCVV = (cvv, brand = "") => {
  const cleaned = cvv.replace(/\D/g, "");
  // American Express usa CVV de 4 dígitos, os outros usam 3
  const expectedLength = brand === "American Express" ? 4 : 3;
  return cleaned.length === expectedLength;
};

/**
 * Valida se a data de expiração do cartão é válida e não está vencida.
 *
 * @param {string} month - Mês (1-12 ou "01"-"12")
 * @param {string} year - Ano (2 ou 4 dígitos)
 * @returns {boolean}
 */
const isValidExpiryDate = (month, year) => {
  const m = parseInt(month);
  let y = parseInt(year);

  // Converte ano de 2 para 4 dígitos (ex: 25 → 2025)
  if (y < 100) y += 2000;

  if (m < 1 || m > 12) return false;

  const now = new Date();
  const expiry = new Date(y, m - 1, 1); // Primeiro dia do mês de expiração
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return expiry >= thisMonth;
};

/**
 * Valida se um valor em centavos é válido para transação.
 *
 * @param {number} amountInCents
 * @returns {{ valid: boolean, message?: string }}
 */
const validateAmount = (amountInCents) => {
  if (!Number.isInteger(amountInCents)) {
    return { valid: false, message: "Valor deve ser um número inteiro em centavos." };
  }
  if (amountInCents < 100) {
    return { valid: false, message: "Valor mínimo é R$ 1,00 (100 centavos)." };
  }
  if (amountInCents > 100000000) { // R$ 1.000.000,00
    return { valid: false, message: "Valor máximo por transação é R$ 1.000.000,00." };
  }
  return { valid: true };
};

module.exports = {
  isValidCPF,
  isValidCNPJ,
  isValidCardNumber,
  getCardBrand,
  isValidCVV,
  isValidExpiryDate,
  validateAmount,
};
