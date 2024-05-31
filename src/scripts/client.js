document.addEventListener('DOMContentLoaded', async function() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você não está logado. Redirecionando para a página de login.');
        window.location.href = '../login/login.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/cliente', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }
        });

        if (response.ok) {
            const data = await response.json();
            document.getElementById('cliente-nome').innerText = data.nome;
            document.getElementById('cliente-email').innerText = data.email;
            // Exiba outras informações do cliente conforme necessário
        } else {
            const error = await response.text();
            alert('Erro ao obter informações do cliente: ' + error);
            localStorage.removeItem('token'); // Remove o token inválido
            window.location.href = '../login/login.html';
        }
    } catch (error) {
        alert('Erro ao obter informações do cliente: ' + error.message);
        localStorage.removeItem('token'); // Remove o token inválido
        window.location.href = '../login/login.html';
    }
});
