const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Plano = sequelize.define(
  'Plano',
  {
    nome: { type: DataTypes.STRING, allowNull: false, unique: true },
    preco: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // em reais
    // Lista de benefícios guardada como JSON
    beneficios: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '[]',
      get() {
        try {
          return JSON.parse(this.getDataValue('beneficios'));
        } catch {
          return [];
        }
      },
      set(valor) {
        this.setDataValue('beneficios', JSON.stringify(valor || []));
      }
    }
  },
  { timestamps: false }
);

module.exports = Plano;
