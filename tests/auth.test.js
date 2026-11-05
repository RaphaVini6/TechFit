const { app, request, sequelize, resetarBanco, criarUsuario } = require('./helpers');
const { User } = require('../models');

beforeAll(resetarBanco);
afterAll(() => sequelize.close());

describe('cadastro', () => {
  test('cria usuário e guarda a senha com hash', async () => {
    const res = await request(app)
      .post('/register')
      .send({ nome: 'Ana', email: 'Ana@Teste.com', senha: 'abcdef' });
    expect(res.status).toBe(201);
    const user = await User.findOne({ where: { email: 'ana@teste.com' } });
    expect(user).not.toBeNull();
    expect(user.senha).not.toBe('abcdef');
    expect(user.papel).toBe('cliente');
  });

  test('rejeita e-mail duplicado', async () => {
    const res = await request(app)
      .post('/register')
      .send({ nome: 'Ana', email: 'ana@teste.com', senha: 'abcdef' });
    expect(res.status).toBe(409);
  });

  test.each([
    [{ nome: '', email: 'a@b.com', senha: 'abcdef' }],
    [{ nome: 'Ana', email: 'invalido', senha: 'abcdef' }],
    [{ nome: 'Ana', email: 'x@b.com', senha: '123' }],
    [{}]
  ])('rejeita dados inválidos %j', async (corpo) => {
    const res = await request(app).post('/register').send(corpo);
    expect(res.status).toBe(400);
  });

  test('cadastro não permite se promover a admin', async () => {
    await request(app)
      .post('/register')
      .send({ nome: 'Eva', email: 'eva@teste.com', senha: 'abcdef', papel: 'admin' });
    const user = await User.findOne({ where: { email: 'eva@teste.com' } });
    expect(user.papel).toBe('cliente');
  });
});

describe('login', () => {
  test('devolve token com credenciais certas', async () => {
    const res = await request(app).post('/login').send({ email: 'ana@teste.com', senha: 'abcdef' });
    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  test('401 com senha errada ou e-mail inexistente', async () => {
    expect((await request(app).post('/login').send({ email: 'ana@teste.com', senha: 'errada' })).status).toBe(
      401
    );
    expect(
      (await request(app).post('/login').send({ email: 'nao@existe.com', senha: 'abcdef' })).status
    ).toBe(401);
  });

  test('JSON malformado devolve 400', async () => {
    const res = await request(app).post('/login').set('Content-Type', 'application/json').send('{ruim');
    expect(res.status).toBe(400);
  });
});

describe('recuperação de senha', () => {
  let link;
  let spy;
  beforeEach(() => {
    spy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });
  afterEach(() => spy.mockRestore());

  test('resposta é igual para e-mail existente e inexistente', async () => {
    const a = await request(app).post('/esqueci-senha').send({ email: 'ana@teste.com' });
    link = spy.mock.calls.map((c) => c[0]).join('\n');
    const b = await request(app).post('/esqueci-senha').send({ email: 'ninguem@teste.com' });
    expect(a.status).toBe(200);
    expect(b.body).toEqual(a.body);
    expect(link).toMatch(/token=[0-9a-f]{64}/);
  });

  test('só o hash do token fica no banco; redefine uma única vez', async () => {
    const token = link.match(/token=([0-9a-f]{64})/)[1];
    const user = await User.findOne({ where: { email: 'ana@teste.com' } });
    expect(user.resetTokenHash).not.toBe(token);

    const ok = await request(app).post('/redefinir-senha').send({ token, senha: 'novasenha' });
    expect(ok.status).toBe(200);
    expect(
      (await request(app).post('/login').send({ email: 'ana@teste.com', senha: 'novasenha' })).status
    ).toBe(200);

    const reuso = await request(app).post('/redefinir-senha').send({ token, senha: 'outrasenha' });
    expect(reuso.status).toBe(400);
  });

  test('token expirado é recusado', async () => {
    const { user } = await criarUsuario({ email: 'exp@teste.com' });
    spy.mockClear();
    await request(app).post('/esqueci-senha').send({ email: 'exp@teste.com' });
    const token = spy.mock.calls
      .map((c) => c[0])
      .join('')
      .match(/token=([0-9a-f]{64})/)[1];
    await user.update({ resetExpira: new Date(Date.now() - 1000) });
    const res = await request(app).post('/redefinir-senha').send({ token, senha: 'novasenha' });
    expect(res.status).toBe(400);
  });
});
