const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authRoutes = require('./routes/auth');
const clienteRoutes = require('./routes/cliente');
const adminRoutes = require('./routes/admin');

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('JWT_SECRET não definido. Configure no .env antes de iniciar.');
    process.exit(1);
  }
  // Em desenvolvimento gera um segredo temporário (os logins caem a cada reinício).
  process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
  if (process.env.NODE_ENV !== 'test') {
    console.warn('Aviso: JWT_SECRET não definido; usando segredo temporário. Veja .env.example.');
  }
}

const app = express();
const SRC = path.join(__dirname, 'src');

// Atrás de proxy (Vercel, Render...) o IP real vem em X-Forwarded-For.
if (process.env.TRUST_PROXY) app.set('trust proxy', Number(process.env.TRUST_PROXY) || 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        // As páginas usam scripts e estilos inline (onclick, <script>, style=).
        scriptSrc: ["'self'", "'unsafe-inline'"],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'https://cdn.jsdelivr.net'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        upgradeInsecureRequests: null
      }
    }
  })
);
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: '50kb' }));
app.use(express.static(SRC));

app.use(authRoutes);
app.use(clienteRoutes);
app.use('/admin', adminRoutes);

app.get('/', (req, res) => res.sendFile(path.join(SRC, 'index.html')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(SRC, 'pages', '404', '404.html'));
});

// JSON inválido e erros inesperados
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'JSON inválido.' });
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Requisição grande demais.' });
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

module.exports = app;
