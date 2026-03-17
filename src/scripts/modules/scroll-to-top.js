const scrollButton = document.querySelector('.scroll-to-top');

// показать/спрятать кнопку "Наверх"
window.addEventListener('scroll', () => {
  if (window.scrollY > 300) {
    scrollButton.classList.add('visible');
  } else {
    scrollButton.classList.remove('visible');
  }
});

// плавный скролл наверх
scrollButton.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
});
