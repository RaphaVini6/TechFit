const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/database');
const User = require('./models/User');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'src')));

app.post('/register', async (req, res) => {
  const { nome, email, senha } = req.body;

  try {
    const user = await User.create({ nome, email, senha });
    res.status(201).send({ message: 'Usuário registrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(400).send({ error: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'src', 'index.html'));
});

app.listen(port, async () => {
  try {
    await sequelize.sync();
    console.log(`Servidor rodando na porta ${port}`);
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados', error);
  }
});
