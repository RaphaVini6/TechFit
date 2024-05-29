document.addEventListener('DOMContentLoaded', function() {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');

  fetch(`/cliente/${userId}`)
    .then(response => response.json())
    .then(data => {
      document.getElementById('cliente-nome').textContent = data.nome;
      document.getElementById('cliente-email').textContent = data.email;
    })
    .catch(error => console.error('Erro:', error));
});
