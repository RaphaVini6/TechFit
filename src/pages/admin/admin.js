const token = localStorage.getItem('token');

function sair(destino) {
  localStorage.removeItem('token');
  window.location.href = destino || '../login/login.html';
}

async function api(url, opcoes) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }
  });
  if (resposta.status === 401) sair('../login/login.html?expirou=1');
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.error || 'Erro inesperado.');
  return dados;
}

const el = (tag, props, ...filhos) => {
  const e = Object.assign(document.createElement(tag), props || {});
  e.append(...filhos);
  return e;
};

let planos = [];
let euId = null;

function linhasDe(texto) {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

async function acao(fn, sucesso) {
  try {
    await fn();
    showMessage(sucesso, 'success');
    await carregar();
  } catch (erro) {
    showMessage(erro.message);
  }
}

function desenharUsuarios(usuarios) {
  const tbody = document.getElementById('usuarios');
  tbody.innerHTML = '';
  usuarios.forEach((u) => {
    const selPlano = el(
      'select',
      { ariaLabel: 'Plano de ' + u.nome },
      el('option', { value: '', textContent: '— nenhum —' }),
      ...planos.map((p) => el('option', { value: p.id, textContent: p.nome, selected: p.id === u.planoId }))
    );
    const selPapel = el(
      'select',
      { ariaLabel: 'Papel de ' + u.nome },
      el('option', { value: 'cliente', textContent: 'cliente', selected: u.papel === 'cliente' }),
      el('option', { value: 'admin', textContent: 'admin', selected: u.papel === 'admin' })
    );

    const salvar = el('button', { type: 'button', textContent: 'Salvar' });
    salvar.addEventListener('click', () =>
      acao(
        () =>
          api('/admin/usuarios/' + u.id, {
            method: 'PATCH',
            body: JSON.stringify({
              papel: selPapel.value,
              planoId: selPlano.value ? Number(selPlano.value) : null
            })
          }),
        'Usuário atualizado.'
      )
    );

    const excluir = el('button', {
      type: 'button',
      className: 'perigo',
      textContent: 'Excluir',
      disabled: u.id === euId
    });
    excluir.addEventListener('click', () => {
      if (confirm('Excluir o usuário ' + u.email + '?')) {
        acao(() => api('/admin/usuarios/' + u.id, { method: 'DELETE' }), 'Usuário excluído.');
      }
    });

    tbody.appendChild(
      el(
        'tr',
        null,
        el('td', { textContent: u.id }),
        el('td', { textContent: u.nome }),
        el('td', { textContent: u.email }),
        el('td', null, selPlano),
        el('td', null, selPapel),
        el('td', null, el('div', { className: 'acoes' }, salvar, excluir))
      )
    );
  });
}

function desenharPlanos() {
  const tbody = document.getElementById('planos');
  tbody.innerHTML = '';
  planos.forEach((p) => {
    const nome = el('input', { type: 'text', value: p.nome, ariaLabel: 'Nome do plano' });
    const preco = el('input', {
      type: 'number',
      min: 0,
      step: 1,
      value: p.preco,
      ariaLabel: 'Preço do plano'
    });
    const benef = el('textarea', {
      rows: 3,
      value: p.beneficios.join('\n'),
      ariaLabel: 'Benefícios do plano'
    });

    const salvar = el('button', { type: 'button', textContent: 'Salvar' });
    salvar.addEventListener('click', () =>
      acao(
        () =>
          api('/admin/planos/' + p.id, {
            method: 'PUT',
            body: JSON.stringify({
              nome: nome.value,
              preco: Number(preco.value),
              beneficios: linhasDe(benef.value)
            })
          }),
        'Plano atualizado.'
      )
    );

    const excluir = el('button', { type: 'button', className: 'perigo', textContent: 'Excluir' });
    excluir.addEventListener('click', () => {
      if (confirm('Excluir o plano ' + p.nome + '?')) {
        acao(() => api('/admin/planos/' + p.id, { method: 'DELETE' }), 'Plano excluído.');
      }
    });

    tbody.appendChild(
      el(
        'tr',
        null,
        el('td', { textContent: p.id }),
        el('td', null, nome),
        el('td', null, preco),
        el('td', null, benef),
        el('td', null, el('div', { className: 'acoes' }, salvar, excluir))
      )
    );
  });
}

async function carregar() {
  planos = await fetch('/planos').then((r) => r.json());
  const usuarios = await api('/admin/usuarios');
  desenharPlanos();
  desenharUsuarios(usuarios);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!token) return sair();
  document.getElementById('btn-sair').addEventListener('click', () => sair());

  document.getElementById('form-novo-plano').addEventListener('submit', (e) => {
    e.preventDefault();
    acao(async () => {
      await api('/admin/planos', {
        method: 'POST',
        body: JSON.stringify({
          nome: document.getElementById('np-nome').value,
          preco: Number(document.getElementById('np-preco').value),
          beneficios: linhasDe(document.getElementById('np-benef').value)
        })
      });
      e.target.reset();
    }, 'Plano criado.');
  });

  try {
    const eu = await api('/cliente');
    euId = eu.id;
    if (eu.papel !== 'admin') {
      window.location.href = '../client/client.html';
      return;
    }
    await carregar();
  } catch (erro) {
    showMessage(erro.message);
  }
});
