// ============================================================
// config/database.js — Conexão com o MongoDB
// ============================================================
// Centralizar a lógica de conexão aqui evita repetição de código
// e facilita trocar o banco de dados no futuro se precisar.
// ============================================================

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Essas opções evitam warnings de depreciação do Mongoose
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar no MongoDB: ${error.message}`);
    // Se não conseguir conectar ao banco, não faz sentido continuar
    process.exit(1);
  }
};

// Evento disparado quando a conexão cai depois de conectada
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️  MongoDB desconectado. Tentando reconectar...");
});

module.exports = connectDB;
