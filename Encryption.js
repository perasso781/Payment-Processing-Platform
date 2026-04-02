// ============================================================
// utils/encryption.js — Funções de Criptografia
// ============================================================
// Agrupa tudo relacionado a criptografia e geração de tokens.
// Em sistemas de pagamento, proteger dados sensíveis é crítico.
// ============================================================

const crypto = require("crypto");
const jwt = require("jsonwebtoken");

// Algoritmo de criptografia simétrica
// AES-256-GCM é considerado seguro para dados financeiros
const ALGORITHM = "aes-256-gcm";

/**
 * Criptografa um texto usando AES-256-GCM.
 * Útil para proteger dados como números de conta bancária.
 *
 * @param {string} text - Texto a ser criptografado
 * @returns {string} - Texto criptografado no formato "iv:authTag:encrypted"
 */
const encrypt = (text) => {
  // O IV (Initialization Vector) deve ser aleatório e único para cada criptografia
  // Isso garante que o mesmo texto criptografado duas vezes resulte em valores diferentes
  const iv = crypto.randomBytes(16);

  const key = Buffer.from(process.env.ENCRYPTION_KEY || "default_key_32_chars_long!!", "utf8").slice(0, 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // O authTag é a "assinatura" da criptografia — garante que ninguém adulterou os dados
  const authTag = cipher.getAuthTag().toString("hex");

  // Retorna tudo junto separado por ":" para podermos descriptografar depois
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

/**
 * Descriptografa um texto que foi criptografado com a função acima.
 *
 * @param {string} encryptedText - No formato "iv:authTag:encrypted"
 * @returns {string} - Texto original descriptografado
 */
const decrypt = (encryptedText) => {
  const [ivHex, authTagHex, encrypted] = encryptedText.split(":");

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const key = Buffer.from(process.env.ENCRYPTION_KEY || "default_key_32_chars_long!!", "utf8").slice(0, 32);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};

/**
 * Gera um JWT token para autenticação do usuário.
 *
 * @param {string} userId - ID do usuário no banco de dados
 * @returns {string} - Token JWT assinado
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
};

/**
 * Mascara dados sensíveis para exibição segura.
 * Ex: "4111111111111111" → "************1111"
 *
 * @param {string} value - Valor a ser mascarado
 * @param {number} visibleChars - Quantos caracteres manter visíveis (do final)
 * @returns {string}
 */
const maskSensitiveData = (value, visibleChars = 4) => {
  if (!value || value.length <= visibleChars) return value;

  const masked = "*".repeat(value.length - visibleChars);
  const visible = value.slice(-visibleChars);
  return masked + visible;
};

/**
 * Gera um token aleatório hexadecimal.
 * Útil para tokens de reset de senha, chaves de API, etc.
 *
 * @param {number} bytes - Tamanho em bytes (o resultado terá bytes*2 caracteres)
 * @returns {string}
 */
const generateRandomToken = (bytes = 32) => {
  return crypto.randomBytes(bytes).toString("hex");
};

module.exports = {
  encrypt,
  decrypt,
  generateToken,
  maskSensitiveData,
  generateRandomToken,
};
