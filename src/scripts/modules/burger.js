const burger = document.querySelector('.header__burger');
const menu = document.querySelector('.main-nav');
const body = document.querySelector('body');

burger.addEventListener('click', () => {
  burger.classList.toggle('header__burger--active');
  menu.classList.toggle('main-nav--shown');
  body.classList.toggle('body--no-scroll');
});

menu.addEventListener('click', (e) => {
  if (e.target.closest('.main-nav__link, .footer-menu__link')) {
    menu.classList.remove('main-nav--shown');
    burger.classList.remove('header__burger--active');
    body.classList.remove('body--no-scroll');
  }
});
