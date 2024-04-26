document.addEventListener("DOMContentLoaded", function() {
    const servicosLink = document.querySelector('li.link:nth-child(3) a');
    const sobreNosLink = document.querySelector('li.link:nth-child(4) a');
    const planosLink = document.querySelector('li.link:nth-child(5) a');

    servicosLink.addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.explore__grid').scrollIntoView({ behavior: 'smooth' });
    });

    sobreNosLink.addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.join__container h2.section__header').scrollIntoView({ behavior: 'smooth' });
    });

    planosLink.addEventListener('click', function(event) {
        event.preventDefault();
        document.querySelector('.price__grid').scrollIntoView({ behavior: 'smooth' });
    });
});

document.addEventListener("DOMContentLoaded", function() {
    // Selecione o botão "COMECE AGORA" pela classe
    var startNowButton = document.querySelector(".start-now");

    // Adicione um evento de clique ao botão
    startNowButton.addEventListener("click", function() {
        // Redirecione para a página de cadastro.html na pasta "front/cadastro"
        window.location.href = "front/cadastro/cadastro.html";
    });
});