document.getElementById('cadastro-form').addEventListener('submit', async function (event) {
  event.preventDefault();
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email, senha })
    });

    const result = await response.json();
    if (response.ok) {
      showMessage(result.message + ' Redirecionando para o login...', 'success');
      setTimeout(() => {
        window.location.href = '../login/login.html';
      }, 1200);
    } else {
      showMessage(result.error || 'Erro ao registrar usuário');
    }
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    showMessage('Não foi possível conectar ao servidor.');
  }
});
