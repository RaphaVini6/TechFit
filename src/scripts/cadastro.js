document.getElementById('cadastroForm').addEventListener('submit', async function(event) {
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

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            window.location.href = '../client/client.html';
        } else {
            alert(result.error || 'Erro ao registrar usuário');
        }
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        alert('Erro ao registrar usuário');
    }
});
