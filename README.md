# 💳 Payment Processing Platform

Uma plataforma de processamento de pagamentos construída com **Node.js**, **Express** e **MongoDB**. 
O projeto simula como empresas reais lidam com transações, autenticação, webhooks e gestão de comerciantes.

> ⚠️ **Aviso:** Este é um projeto de portfólio/demonstração. Não use em produção sem adicionar camadas extras de segurança, certificações PCI-DSS e revisão de um especialista em segurança financeira.

---

## 📁 Estrutura do Projeto

```
payment-platform/
├── src/
│   ├── server.js               # Ponto de entrada da aplicação
│   ├── config/
│   │   └── database.js         # Configuração e conexão com o banco de dados
│   ├── models/
│   │   ├── User.js             # Modelo de usuário (quem faz o pagamento)
│   │   ├── Merchant.js         # Modelo de comerciante (quem recebe)
│   │   └── Transaction.js      # Modelo de transação (o pagamento em si)
│   ├── routes/
│   │   ├── users.js            # Rotas de usuário (/api/users)
│   │   ├── merchants.js        # Rotas de comerciante (/api/merchants)
│   │   └── payments.js         # Rotas de pagamento (/api/payments)
│   ├── controllers/
│   │   ├── userController.js       # Lógica dos usuários
│   │   ├── merchantController.js   # Lógica dos comerciantes
│   │   └── paymentController.js    # Lógica dos pagamentos
│   ├── middleware/
│   │   ├── auth.js             # Verificação de JWT token
│   │   └── errorHandler.js     # Captura e formata todos os erros
│   └── utils/
│       ├── encryption.js       # Hash de senhas e cartões
│       └── validators.js       # Validação de dados (cartão, CPF, email...)
├── frontend/
│   └── dashboard.html          # Dashboard simples para visualizar as transações
├── .env.example                # Variáveis de ambiente necessárias
├── .gitignore
└── package.json
```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos
- Node.js v18+
- MongoDB (local ou Atlas)

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/payment-platform.git
cd payment-platform

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações

# 4. Rode a aplicação
npm run dev
```

A API vai estar disponível em: `http://localhost:3000`

---

## 🔌 Endpoints da API

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/users/register` | Cria uma nova conta |
| POST | `/api/users/login` | Faz login e retorna JWT |
| GET | `/api/users/me` | Retorna dados do usuário logado |

### Comerciantes
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/merchants/register` | Cadastra um novo comerciante |
| GET | `/api/merchants/:id` | Retorna dados de um comerciante |
| GET | `/api/merchants/:id/transactions` | Histórico de transações do comerciante |

### Pagamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/payments/charge` | Processa um pagamento |
| POST | `/api/payments/refund/:id` | Solicita reembolso |
| GET | `/api/payments/:id` | Detalhes de uma transação |
| GET | `/api/payments/history` | Histórico do usuário logado |

---

## 🛡️ Segurança Implementada

- **JWT** para autenticação stateless
- **bcrypt** para hash de senhas
- **Helmet** para headers HTTP seguros
- **Rate Limiting** para evitar abuso da API
- **Validação de dados** em todas as entradas
- **Variáveis de ambiente** para dados sensíveis

---

## 🧰 Tecnologias Usadas

| Tecnologia | Função |
|------------|--------|
| Node.js + Express | Servidor e rotas da API |
| MongoDB + Mongoose | Banco de dados e modelagem |
| JSON Web Token (JWT) | Autenticação |
| bcryptjs | Hash de senhas |
| Helmet | Segurança de headers |
| express-rate-limit | Proteção contra DDoS |
| dotenv | Variáveis de ambiente |

---

## 💡 O que eu aprenderia/melhoraria num projeto real

- [ ] Integração com gateway real (Stripe, PayPal, Adyen)
- [ ] Filas de mensagens para processar pagamentos async (RabbitMQ ou SQS)
- [ ] Webhooks para notificar sistemas externos
- [ ] Certificação PCI-DSS para lidar com dados de cartão
- [ ] Testes automatizados (Jest + Supertest)
- [ ] Deploy com Docker + CI/CD pipeline
- [ ] Logs estruturados com Winston + Elasticsearch

---

## 👨‍💻 Autor

Feito com muito café e vontade de aprender como funciona o mundo dos pagamentos por baixo dos panos.
