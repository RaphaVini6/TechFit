document.getElementById('cadastro-form').addEventListener('submit', async function(event) {
  event.preventDefault();

  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;

  try {
    const response = await fetch('http://localhost:3000/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nome, email, senha })
    });

    if (response.ok) {
      alert('Cadastro realizado com sucesso!');
      window.location.href = '../login/login.html';
    } else {
      const error = await response.text();
      alert('Erro ao cadastrar: ' + error);
    }
  } catch (error) {
    alert('Erro ao cadastrar: ' + error.message);
  }
});
