const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Treino = sequelize.define(
  'Treino',
  {
    dia: { type: DataTypes.STRING, allowNull: false },
    grupo: { type: DataTypes.STRING, allowNull: false },
    ordem: { type: DataTypes.INTEGER, allowNull: false }
  },
  { timestamps: false }
);

module.exports = Treino;
