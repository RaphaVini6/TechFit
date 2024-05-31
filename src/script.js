document.addEventListener("DOMContentLoaded", function() {
  const navLinks = document.querySelectorAll('.nav__links li a');

  function clearActiveStates() {
    navLinks.forEach(link => link.classList.remove('active'));
  }

  function scrollToSection(event, target) {
    event.preventDefault();
    clearActiveStates();
    event.target.classList.add('active');
    document.querySelector(target).scrollIntoView({ behavior: 'smooth' });
  }

  navLinks.forEach((link, index) => {
    const targets = [
      'header',
      '.explore__grid',
      '.join__container h2.section__header',
      '.price__grid'
    ];

    link.addEventListener('click', (event) => scrollToSection(event, targets[index]));
  });

  // Reviews functionality
  const reviews = document.querySelectorAll('.review__container');
  const prevButtons = document.querySelectorAll('.review__nav .prev');
  const nextButtons = document.querySelectorAll('.review__nav .next');
  let currentReview = 0;

  function showReview(index) {
    reviews.forEach((review, i) => {
      review.style.display = i === index ? 'block' : 'none';
    });
  }

  function showNextReview() {
    currentReview = (currentReview + 1) % reviews.length;
    showReview(currentReview);
  }

  function showPrevReview() {
    currentReview = (currentReview - 1 + reviews.length) % reviews.length;
    showReview(currentReview);
  }

  prevButtons.forEach(button => button.addEventListener('click', showPrevReview));
  nextButtons.forEach(button => button.addEventListener('click', showNextReview));

  showReview(currentReview); // Show the first review initially
});
