const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

// Configurações do banco de dados
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Erro ao conectar ao banco de dados', err);
  } else {
    console.log('Conectado ao banco de dados SQLite');
  }
});

// Cria tabelas se não existirem
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL
    )`, (err) => {
    if (err) {
      console.error('Erro ao criar tabela', err);
    } else {
      console.log('Tabela de usuários criada ou já existe');
    }
  });
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Chave secreta para JWT
const SECRET_KEY = 'sua_chave_secreta';

// Rota de cadastro
app.post('/register', (req, res) => {
  const { nome, email, senha } = req.body;

  bcrypt.hash(senha, 10, (err, hash) => {
    if (err) {
      console.error('Erro ao criptografar a senha', err);
      return res.status(500).send('Erro ao criptografar a senha');
    }

    db.run('INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)', [nome, email, hash], function(err) {
      if (err) {
        console.error('Erro ao registrar o usuário', err);
        return res.status(500).send('Erro ao registrar o usuário');
      }
      res.status(201).send('Usuário registrado com sucesso');
    });
  });
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Erro ao buscar o usuário', err);
      return res.status(500).send('Erro ao buscar o usuário');
    }
    if (!user) {
      console.warn('Usuário não encontrado');
      return res.status(404).send('Usuário não encontrado');
    }

    bcrypt.compare(senha, user.senha, (err, result) => {
      if (err) {
        console.error('Erro ao verificar a senha', err);
        return res.status(500).send('Erro ao verificar a senha');
      }
      if (!result) {
        console.warn('Senha incorreta');
        return res.status(401).send('Senha incorreta');
      }

      const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '1h' });
      res.json({ token });
    });
  });
});

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
  if (!token) {
    console.warn('Acesso negado: nenhum token fornecido');
    return res.status(401).send('Acesso negado');
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.error('Token inválido', err);
      return res.status(403).send('Token inválido');
    }
    req.user = user;
    next();
  });
}

// Rota de cliente
app.get('/cliente', authenticateToken, (req, res) => {
  db.get('SELECT * FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err) {
      console.error('Erro ao buscar o cliente', err);
      return res.status(500).send('Erro ao buscar o cliente');
    }
    if (!user) {
      console.warn('Cliente não encontrado');
      return res.status(404).send('Cliente não encontrado');
    }
    res.json({ nome: user.nome, email: user.email });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
