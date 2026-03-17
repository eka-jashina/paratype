// Эта функция создаёт и управляет слайдером (каруселью изображений или контента) внутри заданного контейнера.
// Она возвращает объект с методами init (инициализация) и destroy (уничтожение), чтобы слайдер можно было включать/выключать динамически.
function createSlider(container) {
  // Находим родительский элемент контейнера слайдера. Это может быть карточка шрифта ('new-font-card'), баннер ('banner') или другая карточка.
  // Родитель нужен, чтобы найти ссылку и другие элементы, связанные со слайдером.
  const card = container.parentElement;

  // Если родителя нет, возвращаем пустой объект с заглушками для init и destroy, чтобы ничего не сломать.
  if (!card) {
    return { init: () => {}, destroy: () => {} };
  }

  // Объявляем переменные для ссылки (link) и информации (information). Они будут заполнены в зависимости от типа карточки.
  let link = null;
  let information = null;

  // Проверяем класс родителя, чтобы правильно найти внутренние элементы.
  if (card.classList.contains('new-font-card')) {
    // Для карточки шрифта находим ссылку и блок с информацией.
    link = card.querySelector('.new-font-card__link');
    information = card.querySelector('.new-font-card__information');
  } else if (card.classList.contains('banner')) {
    // Для баннера находим только ссылку.
    link = card.querySelector('.banner__link');
  } else {
    // Для других типов карточек находим общую ссылку.
    link = card.querySelector('a.card__link');
  }

  // Если ссылка не найдена, возвращаем заглушки.
  if (!link) {
    return { init: () => {}, destroy: () => {} };
  }

  // Дополнительная проверка для карточки шрифта: если информации нет, тоже возвращаем заглушки.
  if (card.classList.contains('new-font-card') && !information) {
    return { init: () => {}, destroy: () => {} };
  }

  // Находим ключевые элементы слайдера: трек (контейнер для слайдов), сами слайды и пагинацию.
  const track = container.querySelector('.slider__track');
  const slides = Array.from(container.querySelectorAll('.slider__slide'));
  const pagination = container.querySelector('.slider__pagination');

  // Инициализируем переменные для состояния слайдера:
  let current = 0; // Текущий индекс слайда (начинаем с 0).
  let bullets = []; // Массив буллетов пагинации (будет заполнен позже).
  let startX = 0; // Координата X начала касания/клики.
  let startY = 0; // Координата Y начала (для проверки, не вертикальный ли скролл).
  let startTranslate = 0; // Начальное положение трека при старте перетаскивания.
  let currentTranslate = 0; // Текущее положение трека (в пикселях).
  let isDragging = false; // Флаг, что происходит перетаскивание.
  let hasMoved = false; // Флаг, что было движение (чтобы отличить клик от свайпа).
  let startTime = 0; // Время начала перетаскивания (для расчёта скорости).

  // Функция инициализации слайдера.
  function init() {
    // Проверяем, не инициализирован ли слайдер уже (используем data-атрибут для флага).
    if (container.dataset.sliderInit === 'true') {
      return; // Если да, ничего не делаем.
    }
    container.dataset.sliderInit = 'true'; // Устанавливаем флаг инициализации.

    // Создаём буллеты пагинации для каждого слайда.
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.classList.add('slider__bullet');
      if (i === 0) {
        btn.classList.add('slider__bullet--active');
      }
      // Добавляем обработчик клика: при клике переходим к соответствующему слайду.
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Останавливаем всплытие события (чтобы не срабатывало на родителях).
        goTo(i); // Переходим к слайду с индексом i.
      });
      pagination.appendChild(btn);
    });
    bullets = Array.from(pagination.children);

    // Добавляем слушатели событий для перетаскивания (мышь и тач):
    container.addEventListener('mousedown', start, { passive: false }); // Начало клика мышью.
    container.addEventListener('touchstart', start, { passive: false }); // Начало касания.

    document.addEventListener('mousemove', move, { passive: false }); // Движение мыши.
    document.addEventListener('touchmove', move, { passive: false }); // Движение касания.

    document.addEventListener('mouseup', end); // Конец клика мышью.
    document.addEventListener('touchend', end); // Конец касания.

    // Обработчик клика на слайдере (для перехода по ссылке, если не было свайпа).
    container.addEventListener('click', handleSliderClick);

    // Если есть блок информации (для font-card), добавляем на него обработчик клика.
    if (information) {
      information.addEventListener('click', handleInformationClick);
    }
  }

  // Функция уничтожения слайдера (отключает все слушатели и сбрасывает стили).
  function destroy() {
    // Проверяем, инициализирован ли слайдер.
    if (container.dataset.sliderInit !== 'true') {
      return; // Если нет, ничего не делаем.
    }
    container.dataset.sliderInit = 'false'; // Сбрасываем флаг.

    // Сбрасываем стили трека.
    track.style.transform = ''; // Убираем смещение.
    track.style.transition = ''; // Убираем анимацию.
    pagination.innerHTML = ''; // Очищаем пагинацию.

    // Удаляем все слушатели событий.
    container.removeEventListener('mousedown', start);
    container.removeEventListener('touchstart', start);
    document.removeEventListener('mousemove', move);
    document.removeEventListener('touchmove', move);
    document.removeEventListener('mouseup', end);
    document.removeEventListener('touchend', end);
    container.removeEventListener('click', handleSliderClick);

    if (information) {
      information.removeEventListener('click', handleInformationClick);
    }

    // Сбрасываем переменные состояния.
    current = 0;
    currentTranslate = 0;
    startTranslate = 0;
    hasMoved = false;
  }

  // Обработчик клика на слайдере: если не было движения, переходим по ссылке.
  function handleSliderClick(e) {
    // Игнорируем клики на пагинации или кнопке "избранное".
    if (e.target.closest('.slider__pagination, .new-font-card__favorite, .new-font-card__accordion-button')) {
      return;
    }

    // Если было движение (свайп), предотвращаем клик и переход.
    if (hasMoved) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Если ссылка существует, переходим по ней.
    if (link.href) {
      window.location.href = link.href;
    }
  }

  // Обработчик клика на блоке информации (для font-card): аналогично, но без проверки на движение.
  function handleInformationClick(e) {
    // Игнорируем клики на кнопке "избранное".
    if (e.target.closest('.new-font-card__favorite')) {
      return;
    }

    // Переходим по ссылке.
    if (link.href) {
      window.location.href = link.href;
    }
  }

  // Функция перехода к конкретному слайду по индексу.
  function goTo(index) {
    current = index; // Обновляем текущий индекс.
    currentTranslate = -index * container.offsetWidth; // Рассчитываем смещение (отрицательное, чтобы сдвинуть влево).
    setSliderPosition(true); // Устанавливаем позицию с анимацией.
    // Обновляем активную пулю в пагинации.
    bullets.forEach((b) => b.classList.remove('slider__bullet--active'));
    bullets[index].classList.add('slider__bullet--active');
  }

  // Функция начала перетаскивания (свайпа).
  function start(e) {
    // Игнорируем, если клик на пагинации или "избранном".
    if (e.target.closest('.slider__pagination, .new-font-card__favorite', '.new-font-card__accordion-button')) {
      return;
    }

    // Сохраняем координаты начала и текущее положение.
    startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    startY = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;
    startTranslate = currentTranslate;
    startTime = Date.now(); // Запоминаем время.
    isDragging = true; // Включаем флаг перетаскивания.
    hasMoved = false; // Сбрасываем флаг движения.
    track.style.transition = 'none'; // Убираем анимацию для плавного перетаскивания.
  }

  // Функция движения во время перетаскивания.
  function move(e) {
    if (!isDragging) {
      return; // Если не перетаскиваем, выходим.
    }

    // Получаем текущие координаты.
    const x = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
    const y = e.type.includes('mouse') ? e.pageY : e.touches[0].clientY;

    // Рассчитываем разницу в движении.
    const diffX = Math.abs(x - startX);
    const diffY = Math.abs(y - startY);

    // Если движение больше 5px, считаем, что было движение.
    if (diffX > 5 || diffY > 5) {
      hasMoved = true;
    }

    // Если горизонтальное движение больше вертикального и >10px, обрабатываем свайп.
    if (diffX > diffY && diffX > 10) {
      e.preventDefault(); // Предотвращаем скролл страницы.

      const diff = x - startX; // Разница в X.
      currentTranslate = startTranslate + diff; // Обновляем позицию.

      // Ограничиваем позицию, чтобы не уйти за пределы слайдов.
      const maxTranslate = 0; // Максимум (первый слайд).
      const minTranslate = -(slides.length - 1) * container.offsetWidth; // Минимум (последний слайд).

      if (currentTranslate > maxTranslate) {
        currentTranslate = maxTranslate;
      }
      if (currentTranslate < minTranslate) {
        currentTranslate = minTranslate;
      }

      setSliderPosition(false); // Устанавливаем позицию без анимации.
    } else if (diffY > diffX && diffY > 10) {
      // Если движение вертикальное, отключаем перетаскивание (это скролл страницы).
      isDragging = false;
    }
  }

  // Функция конца перетаскивания.
  function end() {
    if (!isDragging) {
      return; // Если не перетаскивали, выходим.
    }
    isDragging = false; // Сбрасываем флаг.

    if (hasMoved) {
      // Рассчитываем, насколько сдвинули и за какое время (для определения "быстрого свайпа").
      const movedBy = currentTranslate - startTranslate;
      const timeElapsed = Date.now() - startTime;

      // Если сдвиг большой или быстрый, переходим к следующему/предыдущему слайду.
      if ((Math.abs(movedBy) > 50) || (Math.abs(movedBy) > 20 && timeElapsed < 300)) {
        if (movedBy < 0 && current < slides.length - 1) {
          current++;
        } else if (movedBy > 0 && current > 0) {
          current--;
        }
      }

      // Устанавливаем финальную позицию с анимацией.
      currentTranslate = -current * container.offsetWidth;
      track.style.transition = 'transform 0.3s ease';
      setSliderPosition(true);

      // Обновляем пагинацию.
      bullets.forEach((b) => b.classList.remove('slider__bullet--active'));
      bullets[current].classList.add('slider__bullet--active');

      // Через 100ms сбрасываем флаг движения (чтобы клик не срабатывал сразу).
      setTimeout(() => {
        hasMoved = false;
      }, 100);
    } else {
      // Если не было движения, сбрасываем флаг быстро.
      setTimeout(() => {
        hasMoved = false;
      }, 10);
    }
  }

  // Вспомогательная функция для установки позиции трека.
  function setSliderPosition(withTransition) {
    if (withTransition) {
      track.style.transition = 'transform 0.3s ease'; // Включаем анимацию
    }
    track.style.transform = `translateX(${currentTranslate}px)`; // Сдвигаем трек по X.
  }

  // Возвращаем объект с методами init и destroy для управления слайдером.
  return { init, destroy };
}

const sliders = document.querySelectorAll('.slider');
// Создаём экземпляры слайдеров для каждого элемента (массив объектов с init/destroy).
const sliderInstances = Array.from(sliders).map((el) => createSlider(el));

// Функция проверки ширины экрана и активации/деактивации слайдеров.
function activateSliders() {
  // Если ширина экрана <= 1024px (мобильные/планшеты), инициализируем слайдеры.
  if (window.innerWidth <= 1024) {
    sliderInstances.forEach((sl) => sl.init());
  } else {
    sliderInstances.forEach((sl) => sl.destroy());
  }
}

export {activateSliders};
