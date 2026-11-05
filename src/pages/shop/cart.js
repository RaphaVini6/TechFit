// Carrinho simples guardado no navegador (localStorage).
const CHAVE = 'techfit-carrinho';

function lerCarrinho() {
  try {
    const dados = JSON.parse(localStorage.getItem(CHAVE));
    return Array.isArray(dados) ? dados : [];
  } catch (e) {
    return [];
  }
}

function salvarCarrinho(itens) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(itens));
  } catch (e) {
    /* sem armazenamento: segue só em memória */
  }
}

let itens = lerCarrinho();
const moeda = (n) => 'R$ ' + n.toFixed(2).replace('.', ',');

function desenhar() {
  const lista = document.getElementById('cart-lista');
  lista.innerHTML = '';
  itens.forEach((item, i) => {
    const li = document.createElement('li');
    const texto = document.createElement('span');
    texto.textContent = `${item.qtd}x ${item.nome} — ${moeda(item.preco * item.qtd)}`;
    const remover = document.createElement('button');
    remover.type = 'button';
    remover.textContent = 'Remover';
    remover.setAttribute('aria-label', 'Remover ' + item.nome);
    remover.addEventListener('click', () => {
      item.qtd -= 1;
      if (item.qtd <= 0) itens.splice(i, 1);
      salvarCarrinho(itens);
      desenhar();
    });
    li.append(texto, remover);
    lista.appendChild(li);
  });

  const vazio = itens.length === 0;
  const total = itens.reduce((soma, item) => soma + item.preco * item.qtd, 0);
  document.getElementById('cart-vazio').hidden = !vazio;
  document.getElementById('cart-total').hidden = vazio;
  document.getElementById('cart-limpar').hidden = vazio;
  document.getElementById('cart-aviso').hidden = vazio;
  document.getElementById('cart-total').textContent = 'Total: ' + moeda(total);
}

document.querySelectorAll('.add-cart').forEach((botao) => {
  botao.addEventListener('click', () => {
    const nome = botao.dataset.nome;
    const existente = itens.find((i) => i.nome === nome);
    if (existente) existente.qtd += 1;
    else itens.push({ nome, preco: Number(botao.dataset.preco), qtd: 1 });
    salvarCarrinho(itens);
    desenhar();
  });
});

document.getElementById('cart-limpar').addEventListener('click', () => {
  itens = [];
  salvarCarrinho(itens);
  desenhar();
});

desenhar();
