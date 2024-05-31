const path = require('path');
const { Sequelize } = require('sequelize');

// Caminho para o arquivo do banco de dados SQLite
const dbPath = path.join(__dirname, '../config/database.sqlite); ');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath
});

module.exports = sequelize;
