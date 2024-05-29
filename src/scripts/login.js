document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, senha })
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem('token', data.token);
        const payload = JSON.parse(atob(data.token.split('.')[1]));
        window.location.href = `/pages/cliente/client.html?id=${payload.id}`;
      } else {
        alert('Erro no login');
      }
    })
    .catch(error => console.error('Erro:', error));
});
