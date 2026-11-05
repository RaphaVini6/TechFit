const { app, request, sequelize, resetarBanco, criarUsuario, auth } = require('./helpers');
const { Plano, User } = require('../models');

let admin;
let cliente;
beforeAll(async () => {
  await resetarBanco();
  admin = await criarUsuario({ nome: 'Admin', email: 'admin@teste.com', papel: 'admin' });
  cliente = await criarUsuario({ email: 'cli@teste.com' });
});
afterAll(() => sequelize.close());

describe('controle de acesso', () => {
  test.each([
    ['get', '/admin/usuarios'],
    ['post', '/admin/planos'],
    ['delete', '/admin/planos/1']
  ])('%s %s: 401 sem token, 403 para cliente', async (metodo, rota) => {
    expect((await request(app)[metodo](rota)).status).toBe(401);
    expect((await request(app)[metodo](rota).set(auth(cliente.token))).status).toBe(403);
  });

  test('promover-se a admin pela rota de cliente não funciona', async () => {
    await request(app)
      .put('/cliente')
      .set(auth(cliente.token))
      .send({ nome: 'Fulano', email: 'cli@teste.com', papel: 'admin' });
    expect((await User.findByPk(cliente.user.id)).papel).toBe('cliente');
  });
});

describe('usuários', () => {
  test('lista sem expor senhas', async () => {
    const res = await request(app).get('/admin/usuarios').set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(JSON.stringify(res.body)).not.toMatch(/"senha"|resetToken/);
  });

  test('altera papel e plano de um cliente', async () => {
    const plano = await Plano.findOne({ where: { nome: 'Cyborgue' } });
    const res = await request(app)
      .patch(`/admin/usuarios/${cliente.user.id}`)
      .set(auth(admin.token))
      .send({ papel: 'admin', planoId: plano.id });
    expect(res.status).toBe(200);
    const atual = await User.findByPk(cliente.user.id);
    expect(atual.papel).toBe('admin');
    expect(atual.planoId).toBe(plano.id);
    await atual.update({ papel: 'cliente' });
  });

  test('admin não pode rebaixar nem excluir a si mesmo', async () => {
    const rebaixa = await request(app)
      .patch(`/admin/usuarios/${admin.user.id}`)
      .set(auth(admin.token))
      .send({ papel: 'cliente' });
    expect(rebaixa.status).toBeGreaterThanOrEqual(400);
    const exclui = await request(app).delete(`/admin/usuarios/${admin.user.id}`).set(auth(admin.token));
    expect(exclui.status).toBeGreaterThanOrEqual(400);
  });

  test('exclui um cliente', async () => {
    const res = await request(app).delete(`/admin/usuarios/${cliente.user.id}`).set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(await User.findByPk(cliente.user.id)).toBeNull();
  });
});

describe('validação de ids e paginação', () => {
  test('id inválido na URL devolve 400', async () => {
    expect((await request(app).delete('/admin/usuarios/abc').set(auth(admin.token))).status).toBe(400);
    expect((await request(app).put('/admin/planos/-3').set(auth(admin.token)).send({})).status).toBe(400);
    expect(
      (await request(app).patch('/admin/usuarios/999999').set(auth(admin.token)).send({ papel: 'admin' }))
        .status
    ).toBe(404);
  });

  test('PATCH sem campos conhecidos devolve 400', async () => {
    const res = await request(app)
      .patch(`/admin/usuarios/${admin.user.id}`)
      .set(auth(admin.token))
      .send({ nome: 'x' });
    expect(res.status).toBe(400);
  });

  test('limit e offset paginam e informam o total', async () => {
    await criarUsuario({ email: 'pagina@teste.com' });
    const res = await request(app).get('/admin/usuarios?limit=1&offset=1').set(auth(admin.token));
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(Number(res.headers['x-total-count'])).toBeGreaterThanOrEqual(2);
  });
});

describe('planos', () => {
  test('cria, edita e exclui', async () => {
    const novo = await request(app)
      .post('/admin/planos')
      .set(auth(admin.token))
      .send({ nome: 'Teste', preco: 50, beneficios: ['A', 'B'] });
    expect(novo.status).toBe(201);
    const id = novo.body.id;

    const edit = await request(app)
      .put(`/admin/planos/${id}`)
      .set(auth(admin.token))
      .send({ nome: 'Teste 2', preco: 60, beneficios: ['C'] });
    expect(edit.status).toBe(200);
    expect(edit.body).toMatchObject({ nome: 'Teste 2', preco: 60, beneficios: ['C'] });

    expect((await request(app).delete(`/admin/planos/${id}`).set(auth(admin.token))).status).toBe(200);
  });

  test('recusa nome duplicado e preço inválido', async () => {
    const dup = await request(app)
      .post('/admin/planos')
      .set(auth(admin.token))
      .send({ nome: 'Humano', preco: 10, beneficios: [] });
    expect(dup.status).toBe(409);
    for (const preco of [-1, 1.5, 'abc']) {
      const r = await request(app)
        .post('/admin/planos')
        .set(auth(admin.token))
        .send({ nome: 'Novo' + preco, preco, beneficios: [] });
      expect(r.status).toBe(400);
    }
  });

  test('não exclui plano que tem clientes', async () => {
    const plano = await Plano.findOne({ where: { nome: 'Humano' } });
    const { user } = await criarUsuario({ email: 'ocupa@teste.com' });
    await user.update({ planoId: plano.id });
    const res = await request(app).delete(`/admin/planos/${plano.id}`).set(auth(admin.token));
    expect(res.status).toBe(409);
  });
});
