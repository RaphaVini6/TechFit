// Roda antes de cada arquivo de teste: aponta para um banco SEPARADO (os testes apagam as tabelas).
require('dotenv').config();

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'segredo-de-teste';

let url = process.env.TEST_DATABASE_URL;
if (!url && process.env.DATABASE_URL) {
  const u = new URL(process.env.DATABASE_URL);
  u.pathname = u.pathname.replace(/\/?$/, '') + '_test';
  url = u.toString();
}
if (!url) throw new Error('Defina TEST_DATABASE_URL (ou DATABASE_URL) para rodar os testes.');

if (!/_test$/.test(new URL(url).pathname)) {
  throw new Error('O banco de testes precisa terminar em "_test" (os testes apagam os dados).');
}
process.env.DATABASE_URL = url;
