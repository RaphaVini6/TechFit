const { app, request, sequelize, resetarBanco, criarUsuario, auth } = require('./helpers');
const jwt = require('jsonwebtoken');
const { Plano } = require('../models');

let token;
beforeAll(async () => {
  await resetarBanco();
  ({ token } = await criarUsuario());
});
afterAll(() => sequelize.close());

test('rotas protegidas exigem token', async () => {
  expect((await request(app).get('/cliente')).status).toBe(401);
  expect((await request(app).get('/treino')).status).toBe(401);
  expect((await request(app).get('/cliente').set(auth('token-falso'))).status).toBe(401);
});

test('GET /planos é público e traz os 4 planos', async () => {
  const res = await request(app).get('/planos');
  expect(res.status).toBe(200);
  expect(res.body.map((p) => p.nome)).toEqual(
    expect.arrayContaining(['Gratuito', 'Humano', 'Humano Cibernético', 'Cyborgue'])
  );
  expect(Array.isArray(res.body[0].beneficios)).toBe(true);
});

test('GET /cliente não vaza a senha', async () => {
  const res = await request(app).get('/cliente').set(auth(token));
  expect(res.status).toBe(200);
  expect(res.body).toMatchObject({ email: 'fulano@teste.com', papel: 'cliente' });
  expect(JSON.stringify(res.body)).not.toMatch(/senha|resetToken/i);
});

test('PUT /cliente atualiza dados e recusa e-mail de outro usuário', async () => {
  await criarUsuario({ email: 'outro@teste.com' });
  const ok = await request(app)
    .put('/cliente')
    .set(auth(token))
    .send({ nome: 'Novo Nome', email: 'fulano@teste.com' });
  expect(ok.status).toBe(200);
  expect(ok.body.nome).toBe('Novo Nome');
  const dup = await request(app)
    .put('/cliente')
    .set(auth(token))
    .send({ nome: 'X Y', email: 'outro@teste.com' });
  expect(dup.status).toBe(409);
});

test('PUT /cliente/senha confere a senha atual', async () => {
  const errada = await request(app)
    .put('/cliente/senha')
    .set(auth(token))
    .send({ senhaAtual: 'x', novaSenha: 'novasenha' });
  expect(errada.status).toBeGreaterThanOrEqual(400);
  const ok = await request(app)
    .put('/cliente/senha')
    .set(auth(token))
    .send({ senhaAtual: 'senha123', novaSenha: 'novasenha' });
  expect(ok.status).toBe(200);
  expect(ok.body.token).toEqual(expect.any(String));
  token = ok.body.token; // o token novo continua valendo
  expect((await request(app).get('/cliente').set(auth(token))).status).toBe(200);
  expect(
    (await request(app).post('/login').send({ email: 'fulano@teste.com', senha: 'novasenha' })).status
  ).toBe(200);
});

test('trocar a senha derruba tokens emitidos antes', async () => {
  const { user } = await criarUsuario({ email: 'sessao@teste.com' });
  const antigo = jwt.sign({ id: user.id, iat: Math.floor(Date.now() / 1000) - 60 }, process.env.JWT_SECRET);
  expect((await request(app).get('/cliente').set(auth(antigo))).status).toBe(200);
  await user.update({ senhaAlteradaEm: new Date() });
  expect((await request(app).get('/cliente').set(auth(antigo))).status).toBe(401);
});

test('token de usuário apagado deixa de valer', async () => {
  const { user, token: t } = await criarUsuario({ email: 'apagado@teste.com' });
  await user.destroy();
  expect((await request(app).get('/cliente').set(auth(t))).status).toBe(401);
});

test('valida tamanhos e normaliza os dados', async () => {
  const longo = 'a'.repeat(101);
  expect(
    (await request(app).put('/cliente').set(auth(token)).send({ nome: longo, email: 'x@y.com' })).status
  ).toBe(400);
  expect(
    (
      await request(app)
        .put('/cliente/senha')
        .set(auth(token))
        .send({ senhaAtual: 'novasenha', novaSenha: 'a'.repeat(80) })
    ).status
  ).toBe(400);
  const ok = await request(app)
    .put('/cliente')
    .set(auth(token))
    .send({ nome: '  Maria   da  Silva ', email: '  FULANO@Teste.COM ' });
  expect(ok.status).toBe(200);
  expect(ok.body).toMatchObject({ nome: 'Maria da Silva', email: 'fulano@teste.com' });
});

test('planoId inválido devolve 404, nunca 500', async () => {
  for (const planoId of ['abc', null, -1, 1.5, {}]) {
    expect((await request(app).put('/cliente/plano').set(auth(token)).send({ planoId })).status).toBe(404);
  }
});

test('PUT /cliente/plano troca o plano e recusa plano inexistente', async () => {
  const plano = await Plano.findOne({ where: { nome: 'Humano' } });
  const ok = await request(app).put('/cliente/plano').set(auth(token)).send({ planoId: plano.id });
  expect(ok.status).toBe(200);
  expect(ok.body.plano.nome).toBe('Humano');
  const ruim = await request(app).put('/cliente/plano').set(auth(token)).send({ planoId: 999999 });
  expect(ruim.status).toBeGreaterThanOrEqual(400);
});

test('GET /treino devolve a agenda', async () => {
  const res = await request(app).get('/treino').set(auth(token));
  expect(res.status).toBe(200);
  expect(res.body.length).toBeGreaterThanOrEqual(5);
});
