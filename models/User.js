const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define(
  'User',
  {
    nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: { len: [2, 100] }
    },
    email: {
      type: DataTypes.STRING(254),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
      // Sempre minúsculo e sem espaços, não importa por onde o dado entre
      set(valor) {
        this.setDataValue(
          'email',
          String(valor ?? '')
            .trim()
            .toLowerCase()
        );
      }
    },
    senha: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // 'cliente' (padrão) ou 'admin'
    papel: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'cliente',
      validate: { isIn: [['cliente', 'admin']] }
    },
    // Plano contratado (null = ainda sem plano)
    planoId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    // Recuperação de senha: guardamos só o hash do token e a validade
    resetTokenHash: {
      type: DataTypes.STRING,
      allowNull: true
    },
    resetExpira: {
      type: DataTypes.DATE,
      allowNull: true
    },
    // Tokens de login emitidos antes desta data deixam de valer
    senhaAlteradaEm: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
  }
);

module.exports = User;
