document.getElementById('login-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, senha })
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('token', data.token); // Armazena o token JWT
      alert('Login realizado com sucesso!');
      window.location.href = '../client/client.html'; // Redireciona para a página do cliente
    } else {
      const error = await response.text();
      alert('Erro ao fazer login: ' + error);
    }
  } catch (error) {
    alert('Erro ao fazer login: ' + error.message);
  }
});
