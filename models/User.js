const db = require('../config/database');

module.exports = {
  create: (nome, email, senha, callback) => {
    db.run('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)', [nome, email, senha], callback);
  },
  findByEmail: (email, callback) => {
    db.get('SELECT * FROM users WHERE email = ?', [email], callback);
  },
  findById: (id, callback) => {
    db.get('SELECT * FROM users WHERE id = ?', [id], callback);
  }
};
