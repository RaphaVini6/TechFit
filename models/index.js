const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');
const Plano = require('./Plano');
const Treino = require('./Treino');

User.belongsTo(Plano, { foreignKey: 'planoId', as: 'plano' });

const PLANOS_INICIAIS = [
  {
    nome: 'Gratuito',
    preco: 0,
    beneficios: ['Acesso limitado a algumas modalidades', 'Sem assistência online']
  },
  {
    nome: 'Humano',
    preco: 90,
    beneficios: ['Planos montados por nossos profissionais', 'Assistência online em casa']
  },
  {
    nome: 'Humano Cibernético',
    preco: 130,
    beneficios: [
      'Todas as academias regionais',
      'Planos montados por nossos profissionais',
      'Assistência online em casa'
    ]
  },
  {
    nome: 'Cyborgue',
    preco: 170,
    beneficios: [
      'Todas as academias regionais e internacionais',
      'Cadeira de massagem e zona de relaxamento',
      'Planos montados por nossos profissionais',
      'Assistência online em casa',
      'Acesso a todos os eventos e competições'
    ]
  }
];

const TREINOS_INICIAIS = [
  { dia: 'Segunda-Feira', grupo: 'Peito e Tríceps' },
  { dia: 'Terça-Feira', grupo: 'Quadríceps e Panturrilha' },
  { dia: 'Quarta-Feira', grupo: 'Costas e Bíceps' },
  { dia: 'Quinta-Feira', grupo: 'Posterior de Coxa e Glúteo' },
  { dia: 'Sexta-Feira', grupo: 'Ombro e Antebraço' }
];

// Ajustes em bancos que já existiam antes (sync() só cria tabelas novas, não altera as antigas).
async function migrar() {
  const qi = sequelize.getQueryInterface();
  const colunas = await qi.describeTable('Users');
  if (!colunas.senhaAlteradaEm) {
    await qi.addColumn('Users', 'senhaAlteradaEm', { type: DataTypes.DATE, allowNull: true });
  }
  await sequelize.query('CREATE INDEX IF NOT EXISTS users_plano_id ON "Users" ("planoId")');
  await sequelize.query('CREATE INDEX IF NOT EXISTS users_reset_token_hash ON "Users" ("resetTokenHash")');
}

// Cria as tabelas, aplica os ajustes e popula dados iniciais se estiverem vazias.
async function iniciarBanco() {
  await sequelize.sync();
  await migrar();

  if ((await Plano.count()) === 0) {
    await Plano.bulkCreate(PLANOS_INICIAIS);
  }
  if ((await Treino.count()) === 0) {
    await Treino.bulkCreate(TREINOS_INICIAIS.map((t, i) => ({ ...t, ordem: i + 1 })));
  }
}

module.exports = { sequelize, User, Plano, Treino, iniciarBanco };
