function initFilter(
  buttonsSelector,
  itemsSelector,
  cardSelector,
  activeClass = 'is-active'
) {
  const filterButtons = document.querySelectorAll(buttonsSelector);
  const items = document.querySelectorAll(itemsSelector);

  if (!filterButtons.length || !items.length) {
    return;
  }

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove(activeClass));
      btn.classList.add(activeClass);

      const filter = btn.dataset.filter;

      items.forEach((item) => {
        const card = item.querySelector(cardSelector);
        const category = card?.dataset.category;

        if (filter === 'all' || category === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
}

export {initFilter};
