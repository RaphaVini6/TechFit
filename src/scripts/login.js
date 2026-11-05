document.getElementById('login-form').addEventListener('submit', async function (event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token); // Armazena o token JWT
      window.location.href = '../client/client.html'; // Redireciona para a página do cliente
    } else {
      const data = await response.json().catch(() => ({}));
      showMessage(data.error || 'Erro ao fazer login');
    }
  } catch (error) {
    showMessage('Não foi possível conectar ao servidor.');
  }
});

const params = new URLSearchParams(window.location.search);
if (params.has('expirou')) showMessage('Sessão expirada. Faça login novamente.');
if (params.has('erro')) showMessage('Não foi possível conectar ao servidor.');
