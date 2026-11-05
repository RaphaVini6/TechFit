const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Confere o token e também se o usuário ainda existe e não trocou a senha depois que o token foi emitido.
async function autenticar(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');
  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token não informado.' });
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }

  try {
    const user = await User.findByPk(payload.id, { attributes: ['id', 'papel', 'senhaAlteradaEm'] });
    const trocouSenha =
      user && user.senhaAlteradaEm && payload.iat < Math.floor(user.senhaAlteradaEm.getTime() / 1000);
    if (!user || trocouSenha) {
      return res.status(401).json({ error: 'Sessão inválida. Entre novamente.' });
    }
    req.userId = user.id;
    req.userPapel = user.papel;
    next();
  } catch (error) {
    next(error);
  }
}

// Só deixa passar admins (use depois de autenticar).
function exigirAdmin(req, res, next) {
  if (req.userPapel !== 'admin') {
    return res.status(403).json({ error: 'Acesso restrito a administradores.' });
  }
  next();
}

module.exports = autenticar;
module.exports.exigirAdmin = exigirAdmin;
