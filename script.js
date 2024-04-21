// Adicionando um evento de clique ao botão "COMECE AGORA"
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.start-now').addEventListener('click', function() {
        alert('Seu código JavaScript está funcionando!');
    });

    // Rolagem Suave para Links Internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});
