const express = require('express');
const { app, request, sequelize, resetarBanco } = require('./helpers');
const { criarLimite } = require('../middleware/limites');

beforeAll(resetarBanco);
afterAll(() => sequelize.close());

test('helmet envia cabeçalhos de segurança', async () => {
  const res = await request(app).get('/');
  expect(res.headers['x-content-type-options']).toBe('nosniff');
  expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  expect(res.headers['x-powered-by']).toBeUndefined();
});

test('rota inexistente devolve a página 404', async () => {
  const res = await request(app).get('/nao-existe');
  expect(res.status).toBe(404);
  expect(res.text).toContain('<html');
});

test('páginas estáticas são servidas', async () => {
  expect((await request(app).get('/pages/login/login.html')).status).toBe(200);
});

test('limite de requisições responde 429 depois do máximo', async () => {
  const mini = express();
  mini.use(criarLimite({ janelaMs: 60000, max: 3, mensagem: 'devagar', ativoEmTeste: true }));
  mini.get('/', (req, res) => res.json({ ok: true }));
  for (let i = 0; i < 3; i++) expect((await request(mini).get('/')).status).toBe(200);
  const bloqueado = await request(mini).get('/');
  expect(bloqueado.status).toBe(429);
  expect(bloqueado.body.error).toBe('devagar');
});

test('limite com soFalhas ignora respostas de sucesso', async () => {
  const mini = express();
  mini.use(criarLimite({ janelaMs: 60000, max: 2, mensagem: 'devagar', ativoEmTeste: true, soFalhas: true }));
  mini.get('/ok', (req, res) => res.json({ ok: true }));
  mini.get('/falha', (req, res) => res.status(401).json({}));
  for (let i = 0; i < 5; i++) expect((await request(mini).get('/ok')).status).toBe(200);
  await request(mini).get('/falha');
  await request(mini).get('/falha');
  expect((await request(mini).get('/falha')).status).toBe(429);
});
