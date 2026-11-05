const express = require('express');
const { UniqueConstraintError } = require('sequelize');
const { sequelize, User, Plano } = require('../models');
const autenticar = require('../middleware/auth');
const { exigirAdmin } = require('../middleware/auth');
const wrap = require('../middleware/async');
const { lerId, lerPlano } = require('../utils/validacao');

const router = express.Router();

// Tudo aqui exige login E papel de admin
router.use(autenticar, exigirAdmin);

// Valida :id da URL e deixa o número em req.alvoId
router.param('id', (req, res, next, valor) => {
  const id = lerId(valor);
  if (!id) return res.status(400).json({ error: 'Id inválido.' });
  req.alvoId = id;
  next();
});

// ---------- Usuários ----------
// Paginação opcional: ?limit=50&offset=0 (total em X-Total-Count)
router.get(
  '/usuarios',
  wrap(async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 100, 1), 500);
    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);
    const { rows, count } = await User.findAndCountAll({
      attributes: ['id', 'nome', 'email', 'papel', 'planoId', 'createdAt'],
      include: [{ model: Plano, as: 'plano', attributes: ['id', 'nome'] }],
      order: [['id', 'ASC']],
      limit,
      offset
    });
    res.set('X-Total-Count', String(count));
    res.json(rows);
  })
);

// Altera papel e/ou plano de um usuário
router.patch(
  '/usuarios/:id',
  wrap(async (req, res) => {
    const id = req.alvoId;
    const mudancas = {};

    if (req.body.papel !== undefined) {
      if (!['cliente', 'admin'].includes(req.body.papel)) {
        return res.status(400).json({ error: 'Papel inválido.' });
      }
      // Evita o admin se rebaixar sem querer e ficar sem nenhum admin
      if (id === req.userId && req.body.papel !== 'admin') {
        return res.status(400).json({ error: 'Você não pode remover seu próprio acesso de admin.' });
      }
      mudancas.papel = req.body.papel;
    }
    if (req.body.planoId !== undefined) {
      if (req.body.planoId === null) {
        mudancas.planoId = null;
      } else {
        const planoId = lerId(req.body.planoId);
        if (!planoId || !(await Plano.findByPk(planoId))) {
          return res.status(404).json({ error: 'Plano não encontrado.' });
        }
        mudancas.planoId = planoId;
      }
    }
    if (!Object.keys(mudancas).length) {
      return res.status(400).json({ error: 'Nada para alterar. Envie papel e/ou planoId.' });
    }

    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    await user.update(mudancas);
    res.json({ id: user.id, nome: user.nome, email: user.email, papel: user.papel, planoId: user.planoId });
  })
);

router.delete(
  '/usuarios/:id',
  wrap(async (req, res) => {
    if (req.alvoId === req.userId) {
      return res.status(400).json({ error: 'Você não pode excluir a própria conta.' });
    }
    const apagados = await User.destroy({ where: { id: req.alvoId } });
    if (!apagados) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ message: 'Usuário excluído.' });
  })
);

// ---------- Planos ----------
const nomeDuplicado = (res) => res.status(409).json({ error: 'Já existe um plano com esse nome.' });

router.post(
  '/planos',
  wrap(async (req, res) => {
    const { erro, valor } = lerPlano(req.body);
    if (erro) return res.status(400).json({ error: erro });
    try {
      res.status(201).json(await Plano.create(valor));
    } catch (error) {
      if (error instanceof UniqueConstraintError) return nomeDuplicado(res);
      throw error;
    }
  })
);

router.put(
  '/planos/:id',
  wrap(async (req, res) => {
    const { erro, valor } = lerPlano(req.body);
    if (erro) return res.status(400).json({ error: erro });
    const plano = await Plano.findByPk(req.alvoId);
    if (!plano) return res.status(404).json({ error: 'Plano não encontrado.' });
    try {
      await plano.update(valor);
    } catch (error) {
      if (error instanceof UniqueConstraintError) return nomeDuplicado(res);
      throw error;
    }
    res.json(plano);
  })
);

router.delete(
  '/planos/:id',
  wrap(async (req, res) => {
    // Conta e apaga na mesma transação, para ninguém assinar o plano no meio do caminho
    const resultado = await sequelize.transaction(async (transaction) => {
      if (await User.count({ where: { planoId: req.alvoId }, transaction })) return 'em-uso';
      return (await Plano.destroy({ where: { id: req.alvoId }, transaction })) ? 'ok' : 'nao-existe';
    });

    if (resultado === 'em-uso') {
      return res.status(409).json({ error: 'Há clientes neste plano. Mude o plano deles antes de excluir.' });
    }
    if (resultado === 'nao-existe') return res.status(404).json({ error: 'Plano não encontrado.' });
    res.json({ message: 'Plano excluído.' });
  })
);

module.exports = router;
