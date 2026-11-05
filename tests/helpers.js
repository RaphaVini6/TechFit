const bcrypt = require('bcryptjs');
const request = require('supertest');
const app = require('../app');
const { sequelize, User, iniciarBanco } = require('../models');

async function resetarBanco() {
  await sequelize.sync({ force: true });
  await iniciarBanco(); // recria planos e treino padrão
}

async function criarUsuario({
  nome = 'Fulano',
  email = 'fulano@teste.com',
  senha = 'senha123',
  papel = 'cliente'
} = {}) {
  const user = await User.create({ nome, email, senha: await bcrypt.hash(senha, 4), papel });
  const res = await request(app).post('/login').send({ email, senha });
  return { user, token: res.body.token, senha };
}

const auth = (token) => ({ Authorization: `Bearer ${token}` });

module.exports = { app, request, sequelize, resetarBanco, criarUsuario, auth };
