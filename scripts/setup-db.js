// Cria as tabelas, os dados iniciais e a conta admin.
// Uso: npm run db:setup   (o banco precisa estar no ar: npm run db:up)
require('dotenv').config();

const bcrypt = require('bcryptjs');
const { iniciarBanco, User, sequelize } = require('../models');

async function main() {
  const email = String(process.env.ADMIN_EMAIL || '')
    .trim()
    .toLowerCase();
  const senha = String(process.env.ADMIN_PASSWORD || '');
  const nome = String(process.env.ADMIN_NOME || 'Administrador').trim();

  if (!email || senha.length < 8) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_PASSWORD (mínimo 8 caracteres) no .env.');
  }

  await sequelize.authenticate();
  await iniciarBanco();
  console.log('Tabelas e dados iniciais (planos e treino) prontos.');

  const existente = await User.findOne({ where: { email } });
  if (existente) {
    // Não troca a senha de um admin que já existe; só garante o papel.
    if (existente.papel !== 'admin') await existente.update({ papel: 'admin' });
    console.log(`Conta admin já existe: ${email} (senha mantida).`);
  } else {
    await User.create({ nome, email, senha: await bcrypt.hash(senha, 10), papel: 'admin' });
    console.log(`Conta admin criada: ${email} (senha definida em ADMIN_PASSWORD no .env).`);
  }
}

main()
  .catch((erro) => {
    console.error('Falha no setup do banco:', erro.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
