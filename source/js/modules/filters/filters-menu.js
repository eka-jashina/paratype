const filter = document.querySelector('.new-fonts__filter');
const filterBtn = filter.querySelector('.new-fonts__filter-button');
const list = filter.querySelector('.new-fonts__categories-list');
const categories = list.querySelectorAll('.new-fonts__category');

// инициализация: берём активный пункт и вставляем в кнопку
const activeItem = list.querySelector('.is-active');
if (activeItem) {
  filterBtn.textContent = activeItem.textContent;
}

// открытие/закрытие списка
filterBtn.addEventListener('click', () => {
  filter.classList.toggle('is-open');
});

// выбор пункта
categories.forEach((item) => {
  item.addEventListener('click', () => {
    categories.forEach((el) => el.classList.remove('is-active'));
    item.classList.add('is-active');
    filterBtn.textContent = item.textContent;
    filter.classList.remove('is-open');
  });
});

// клик вне меню
document.addEventListener('click', (e) => {
  if (!filter.contains(e.target)) {
    filter.classList.remove('is-open');
  }
});
