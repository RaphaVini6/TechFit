const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const sequelize = require('./config/database');
const User = require('./models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'src')));

// Função para gerar token JWT
function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, 'your-secret-key', { expiresIn: '1h' });
}

// Rota para registrar um novo usuário
app.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        const user = await User.create({ nome, email, senha: hashedPassword });
        res.status(201).send({ message: 'Usuário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(400).send({ error: error.message });
    }
});

// Rota para login
app.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (!user || !await bcrypt.compare(senha, user.senha)) {
            return res.status(401).send('Email ou senha incorretos');
        }

        const token = generateToken(user);
        res.send({ token });
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        res.status(500).send({ error: error.message });
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
