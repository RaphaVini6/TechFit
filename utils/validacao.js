// Leitura e validação dos dados que chegam pela API. Cada função devolve { valor } ou { erro }.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SENHA_MIN = 6;
const SENHA_MAX = 72; // limite do bcrypt: o que passa de 72 bytes é ignorado

function lerNome(entrada) {
  const nome = String(entrada ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  if (nome.length < 2 || nome.length > 100) return { erro: 'Informe seu nome (de 2 a 100 caracteres).' };
  return { valor: nome };
}

function lerEmail(entrada) {
  const email = String(entrada ?? '')
    .trim()
    .toLowerCase();
  if (email.length > 254 || !EMAIL_REGEX.test(email)) return { erro: 'E-mail inválido.' };
  return { valor: email };
}

function lerSenha(entrada, rotulo = 'A senha') {
  const senha = String(entrada ?? '');
  if (senha.length < SENHA_MIN) return { erro: `${rotulo} deve ter pelo menos ${SENHA_MIN} caracteres.` };
  if (Buffer.byteLength(senha) > SENHA_MAX)
    return { erro: `${rotulo} deve ter no máximo ${SENHA_MAX} bytes.` };
  return { valor: senha };
}

// Id vindo da URL ou do corpo: inteiro positivo ou null.
function lerId(entrada) {
  const n = Number(entrada);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
}

function lerPlano(corpo) {
  const nome = String(corpo.nome ?? '')
    .trim()
    .replace(/\s+/g, ' ');
  const preco = typeof corpo.preco === 'string' && corpo.preco.trim() === '' ? NaN : Number(corpo.preco);
  const bruto = Array.isArray(corpo.beneficios) ? corpo.beneficios : [];
  const beneficios = bruto.map((b) => String(b).trim()).filter(Boolean);

  if (nome.length < 2 || nome.length > 60) return { erro: 'O nome do plano deve ter de 2 a 60 caracteres.' };
  if (!Number.isInteger(preco) || preco < 0 || preco > 100000) {
    return { erro: 'O preço deve ser um número inteiro entre 0 e 100000.' };
  }
  if (beneficios.length > 20 || beneficios.some((b) => b.length > 200)) {
    return { erro: 'Use até 20 benefícios de no máximo 200 caracteres.' };
  }
  return { valor: { nome, preco, beneficios } };
}

module.exports = { lerNome, lerEmail, lerSenha, lerId, lerPlano };
