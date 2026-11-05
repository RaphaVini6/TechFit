const crypto = require('crypto');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError, Op } = require('sequelize');
const { User } = require('../models');
const wrap = require('../middleware/async');
const { limiteLogin, limiteRecuperacao, limiteCadastro } = require('../middleware/limites');
const { lerNome, lerEmail, lerSenha } = require('../utils/validacao');

const router = express.Router();
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const gerarToken = (user) => jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });

// Cadastro
router.post(
  '/register',
  limiteCadastro,
  wrap(async (req, res) => {
    const nome = lerNome(req.body.nome);
    const email = lerEmail(req.body.email);
    const senha = lerSenha(req.body.senha);
    const erro = nome.erro || email.erro || senha.erro;
    if (erro) return res.status(400).json({ error: erro });

    try {
      await User.create({ nome: nome.valor, email: email.valor, senha: await bcrypt.hash(senha.valor, 10) });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({ error: 'Este e-mail já está cadastrado.' });
      }
      throw error;
    }
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
  })
);

// Login
router.post(
  '/login',
  limiteLogin,
  wrap(async (req, res) => {
    const email = String(req.body.email ?? '')
      .trim()
      .toLowerCase();
    const senha = String(req.body.senha ?? '');

    const user = await User.findOne({ where: { email } });
    const ok = user && (await bcrypt.compare(senha, user.senha));
    if (!ok) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });

    res.json({ token: gerarToken(user) });
  })
);

// Pede a recuperação de senha. A resposta é sempre a mesma, exista o e-mail ou não.
router.post(
  '/esqueci-senha',
  limiteRecuperacao,
  wrap(async (req, res) => {
    const email = String(req.body.email ?? '')
      .trim()
      .toLowerCase();
    const resposta = {
      message: 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.'
    };

    const user = await User.findOne({ where: { email } });
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await user.update({
        resetTokenHash: hashToken(token),
        resetExpira: new Date(Date.now() + 30 * 60 * 1000)
      });
      // Ainda não há envio de e-mail configurado: o link aparece no console do servidor.
      const base = process.env.APP_URL || `http://localhost:${process.env.PORT || 3000}`;
      console.log(
        `[recuperação de senha] ${email}: ${base}/pages/redefinir-senha/redefinir-senha.html?token=${token}`
      );
    }
    res.json(resposta);
  })
);

// Define a nova senha a partir do token
router.post(
  '/redefinir-senha',
  limiteLogin,
  wrap(async (req, res) => {
    const token = String(req.body.token ?? '');
    const senha = lerSenha(req.body.senha);
    if (senha.erro) return res.status(400).json({ error: senha.erro });

    const user =
      token &&
      (await User.findOne({
        where: { resetTokenHash: hashToken(token), resetExpira: { [Op.gt]: new Date() } }
      }));
    if (!user) return res.status(400).json({ error: 'Link inválido ou expirado. Peça um novo.' });

    await user.update({
      senha: await bcrypt.hash(senha.valor, 10),
      resetTokenHash: null,
      resetExpira: null,
      senhaAlteradaEm: new Date() // derruba as sessões abertas
    });
    res.json({ message: 'Senha alterada com sucesso!' });
  })
);

module.exports = router;
