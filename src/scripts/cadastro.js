document.getElementById('cadastro-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const nome = document.getElementById('usuario').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  fetch('/cadastro', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ nome, email, senha })
  })
    .then(response => response.text())
    .then(data => alert(data))
    .catch(error => console.error('Erro:', error));
});
