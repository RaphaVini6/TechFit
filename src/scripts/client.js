let token = localStorage.getItem('token');

function sair(destino) {
  localStorage.removeItem('token');
  window.location.href = destino || '../login/login.html';
}

// Chamada autenticada à API. Se o token não valer mais, volta para o login.
async function api(url, opcoes) {
  const resposta = await fetch(url, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    }
  });
  if (resposta.status === 401) sair('../login/login.html?expirou=1');
  const dados = await resposta.json().catch(() => ({}));
  if (!resposta.ok) throw new Error(dados.error || 'Erro inesperado.');
  return dados;
}

function openTab(nome, botao) {
  document.querySelectorAll('.tab').forEach((t) => {
    t.style.display = 'none';
  });
  document.querySelectorAll('.tablink').forEach((b) => b.setAttribute('aria-selected', 'false'));
  document.getElementById(nome).style.display = 'block';
  if (botao) botao.setAttribute('aria-selected', 'true');
  document.getElementById('msg').hidden = true;
}

function mostrarCliente(cliente) {
  document.getElementById('link-admin').hidden = cliente.papel !== 'admin';
  document.getElementById('cliente-nome').value = cliente.nome;
  document.getElementById('cliente-email').value = cliente.email;
  document.getElementById('plano-atual').textContent = cliente.plano
    ? `${cliente.plano.nome} (${cliente.plano.preco ? 'R$' + cliente.plano.preco + '/mês' : 'grátis'})`
    : 'nenhum plano contratado';
  document.querySelectorAll('.plano-card').forEach((card) => {
    const atual = Number(card.dataset.id) === cliente.planoId;
    card.classList.toggle('plano-card--atual', atual);
    const botao = card.querySelector('button');
    botao.disabled = atual;
    botao.textContent = atual ? 'Plano atual' : 'Escolher';
  });
}

async function carregarPlanos(cliente) {
  const planos = await fetch('/planos').then((r) => r.json());
  const lista = document.getElementById('lista-planos');
  lista.innerHTML = '';
  planos.forEach((plano) => {
    const card = document.createElement('div');
    card.className = 'plano-card';
    card.dataset.id = plano.id;

    const titulo = document.createElement('h3');
    titulo.textContent = plano.nome;
    const preco = document.createElement('p');
    preco.className = 'plano-preco';
    preco.textContent = plano.preco ? 'R$' + plano.preco + '/mês' : 'Grátis';
    const ul = document.createElement('ul');
    plano.beneficios.forEach((b) => {
      const li = document.createElement('li');
      li.textContent = b;
      ul.appendChild(li);
    });
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.addEventListener('click', async () => {
      try {
        const atualizado = await api('/cliente/plano', {
          method: 'PUT',
          body: JSON.stringify({ planoId: plano.id })
        });
        mostrarCliente(atualizado);
        showMessage('Plano alterado para ' + plano.nome + '.', 'success');
      } catch (erro) {
        showMessage(erro.message);
      }
    });

    card.append(titulo, preco, ul, botao);
    lista.appendChild(card);
  });
  mostrarCliente(cliente);
}

async function carregarTreino() {
  const treinos = await api('/treino');
  const lista = document.getElementById('lista-treino');
  lista.innerHTML = '';
  treinos.forEach((t) => {
    const li = document.createElement('li');
    const dia = document.createElement('strong');
    dia.textContent = t.dia;
    li.append(dia, ' — ' + t.grupo);
    lista.appendChild(li);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  if (!token) return sair();

  document.getElementById('btn-sair').addEventListener('click', () => sair());

  document.getElementById('form-perfil').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const cliente = await api('/cliente', {
        method: 'PUT',
        body: JSON.stringify({
          nome: document.getElementById('cliente-nome').value,
          email: document.getElementById('cliente-email').value
        })
      });
      mostrarCliente(cliente);
      showMessage('Dados atualizados.', 'success');
    } catch (erro) {
      showMessage(erro.message);
    }
  });

  document.getElementById('form-senha').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const r = await api('/cliente/senha', {
        method: 'PUT',
        body: JSON.stringify({
          senhaAtual: document.getElementById('senha-atual').value,
          novaSenha: document.getElementById('senha-nova').value
        })
      });
      e.target.reset();
      if (r.token) {
        token = r.token; // as outras sessões foram encerradas; esta continua
        localStorage.setItem('token', token);
      }
      showMessage(r.message, 'success');
    } catch (erro) {
      showMessage(erro.message);
    }
  });

  try {
    const cliente = await api('/cliente');
    await carregarPlanos(cliente);
    await carregarTreino();
  } catch (erro) {
    showMessage(erro.message);
  }

  openTab('plano', document.querySelector('.tablink'));
});
