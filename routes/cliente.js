const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { UniqueConstraintError } = require('sequelize');
const { User, Plano, Treino } = require('../models');
const autenticar = require('../middleware/auth');
const wrap = require('../middleware/async');
const { lerNome, lerEmail, lerSenha, lerId } = require('../utils/validacao');

const router = express.Router();

// Planos disponíveis (público)
router.get(
  '/planos',
  wrap(async (req, res) => {
    res.json(await Plano.findAll({ order: [['preco', 'ASC']] }));
  })
);

const dadosDoCliente = (id) =>
  User.findByPk(id, {
    attributes: ['id', 'nome', 'email', 'papel', 'planoId'],
    include: [{ model: Plano, as: 'plano' }]
  });

router.get(
  '/cliente',
  autenticar,
  wrap(async (req, res) => {
    const user = await dadosDoCliente(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  })
);

// Atualiza nome e e-mail
router.put(
  '/cliente',
  autenticar,
  wrap(async (req, res) => {
    const nome = lerNome(req.body.nome);
    const email = lerEmail(req.body.email);
    const erro = nome.erro || email.erro;
    if (erro) return res.status(400).json({ error: erro });

    try {
      await User.update({ nome: nome.valor, email: email.valor }, { where: { id: req.userId } });
    } catch (error) {
      if (error instanceof UniqueConstraintError) {
        return res.status(409).json({ error: 'Este e-mail já está em uso.' });
      }
      throw error;
    }
    res.json(await dadosDoCliente(req.userId));
  })
);

// Troca de senha (pede a senha atual). Devolve um token novo: as outras sessões deixam de valer.
router.put(
  '/cliente/senha',
  autenticar,
  wrap(async (req, res) => {
    const nova = lerSenha(req.body.novaSenha, 'A nova senha');
    if (nova.erro) return res.status(400).json({ error: nova.erro });

    const user = await User.findByPk(req.userId);
    if (!user || !(await bcrypt.compare(String(req.body.senhaAtual ?? ''), user.senha))) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }
    await user.update({
      senha: await bcrypt.hash(nova.valor, 10),
      resetTokenHash: null,
      resetExpira: null,
      senhaAlteradaEm: new Date()
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ message: 'Senha alterada com sucesso!', token });
  })
);

// Escolhe (assina) um plano
router.put(
  '/cliente/plano',
  autenticar,
  wrap(async (req, res) => {
    const id = lerId(req.body.planoId);
    const plano = id && (await Plano.findByPk(id));
    if (!plano) return res.status(404).json({ error: 'Plano não encontrado.' });
    await User.update({ planoId: plano.id }, { where: { id: req.userId } });
    res.json(await dadosDoCliente(req.userId));
  })
);

// Treino do mês
router.get(
  '/treino',
  autenticar,
  wrap(async (req, res) => {
    res.json(await Treino.findAll({ order: [['ordem', 'ASC']] }));
  })
);

module.exports = router;
