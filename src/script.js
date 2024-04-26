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

