document.addEventListener("DOMContentLoaded", function() {
  const inicioLink = document.querySelector('li.link:nth-child(1) a');
  const servicosLink = document.querySelector('li.link:nth-child(2) a');
  const sobreNosLink = document.querySelector('li.link:nth-child(3) a');
  const planosLink = document.querySelector('li.link:nth-child(4) a');

  function clearActiveStates() {
    document.querySelectorAll('.nav__links li a').forEach(link => {
      link.classList.remove('active');
    });
  }

  inicioLink.addEventListener('click', function(event) {
    event.preventDefault();
    clearActiveStates();
    inicioLink.classList.add('active');
    document.querySelector('header').scrollIntoView({ behavior: 'smooth' });
  });

  servicosLink.addEventListener('click', function(event) {
    event.preventDefault();
    clearActiveStates();
    servicosLink.classList.add('active');
    document.querySelector('.explore__grid').scrollIntoView({ behavior: 'smooth' });
  });

  sobreNosLink.addEventListener('click', function(event) {
    event.preventDefault();
    clearActiveStates();
    sobreNosLink.classList.add('active');
    document.querySelector('.join__container h2.section__header').scrollIntoView({ behavior: 'smooth' });
  });

  planosLink.addEventListener('click', function(event) {
    event.preventDefault();
    clearActiveStates();
    planosLink.classList.add('active');
    document.querySelector('.price__grid').scrollIntoView({ behavior: 'smooth' });
  });
});
