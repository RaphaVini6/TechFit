document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
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

    const data = await response.json();

    if (response.ok) {
      alert('Usuário registrado com sucesso!');
      // Redirecione para outra página ou limpe o formulário
      window.location.href = '/'; // Redirecione para a página inicial, por exemplo
    } else {
      alert(`Erro ao registrar usuário: ${data.error}`);
    }
  } catch (error) {
    console.error('Erro ao enviar solicitação de registro:', error);
    alert('Erro ao registrar usuário');
  }
});
