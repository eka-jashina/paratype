function dragScroll(selector = '.scroll-container', breakpoint = 1023) {
  const containers = document.querySelectorAll(selector);

  containers.forEach((container) => {
    let isDown = false;
    let startX;
    let scrollLeft;

    // --- мышь ---
    container.addEventListener('mousedown', (e) => {
      isDown = true;
      container.classList.add('active');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    });

    container.addEventListener('mouseleave', () => {
      isDown = false;
      container.classList.remove('active');
    });

    container.addEventListener('mouseup', () => {
      isDown = false;
      container.classList.remove('active');
    });

    container.addEventListener('mousemove', (e) => {
      if (!isDown) {
        return;
      }
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      container.scrollLeft = scrollLeft - walk;
    });

    // --- клавиатура ---
    function updateTabindex() {
      if (window.innerWidth <= breakpoint) {
        container.setAttribute('tabindex', '0');
      } else {
        container.removeAttribute('tabindex');
      }
    }
    updateTabindex();
    window.addEventListener('resize', updateTabindex);

    container.addEventListener('keydown', (e) => {
      if (document.activeElement !== container) {
        return;
      }
      const step = 50;
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          container.scrollLeft -= step;
          break;
        case 'ArrowRight':
          e.preventDefault();
          container.scrollLeft += step;
          break;
        case 'Home':
          e.preventDefault();
          container.scrollLeft = 0;
          break;
        case 'End':
          e.preventDefault();
          container.scrollLeft = container.scrollWidth;
          break;
      }
    });
  });
}

export {dragScroll};
