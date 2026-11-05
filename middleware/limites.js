const rateLimit = require('express-rate-limit');

// Em testes o limite é desligado, exceto quando o próprio teste pede (opcoes.ativoEmTeste).
function criarLimite({ janelaMs, max, mensagem, ativoEmTeste = false, soFalhas = false }) {
  return rateLimit({
    windowMs: janelaMs,
    limit: max,
    skipSuccessfulRequests: soFalhas,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    skip: () => process.env.NODE_ENV === 'test' && !ativoEmTeste,
    handler: (req, res) => res.status(429).json({ error: mensagem })
  });
}

const limiteLogin = criarLimite({
  janelaMs: 15 * 60 * 1000,
  max: 10,
  soFalhas: true,
  mensagem: 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
});

const limiteRecuperacao = criarLimite({
  janelaMs: 60 * 60 * 1000,
  max: 5,
  mensagem: 'Muitos pedidos de recuperação. Tente novamente mais tarde.'
});

const limiteCadastro = criarLimite({
  janelaMs: 60 * 60 * 1000,
  max: 20,
  mensagem: 'Muitos cadastros deste endereço. Tente novamente mais tarde.'
});

module.exports = { criarLimite, limiteLogin, limiteRecuperacao, limiteCadastro };
