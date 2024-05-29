const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();

mongoose.connect('mongodb://localhost:27017/techfit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).then(() => {
  console.log('Conectado ao MongoDB');
}).catch(err => {
  console.error('Erro ao conectar ao MongoDB', err);
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Rota de cadastro
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha } = req.body;
  const novoUsuario = new User({ nome, email, senha });

  try {
    await novoUsuario.save();
    res.status(201).send('Usuário cadastrado com sucesso');
  } catch (error) {
    res.status(400).send('Erro ao cadastrar usuário: ' + error.message);
  }
});

// Rota de login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await User.findOne({ email });

    if (!usuario) {
      return res.status(400).send('Usuário não encontrado');
    }

    if (usuario.senha !== senha) {
      return res.status(400).send('Senha incorreta');
    }

    const token = jwt.sign({ id: usuario._id, nome: usuario.nome, email: usuario.email }, 'seusegredoaqui', {
      expiresIn: '1h'
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(400).send('Erro ao fazer login: ' + error.message);
  }
});

// Rota para obter informações do cliente
app.get('/cliente/:id', async (req, res) => {
  try {
    const usuario = await User.findById(req.params.id);
    res.status(200).json(usuario);
  } catch (error) {
    res.status(400).send('Erro ao obter informações do cliente: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
