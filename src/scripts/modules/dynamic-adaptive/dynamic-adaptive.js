export class DynamicAdaptive {
  constructor(type) {
    this.type = type;
    this._baseWindowWidth = '767';
  }

  init() {
    this._objectsArray = [];
    this._daClassName = 'dynamic-adaptive';
    this._daCopyClassName = 'dynamic-adaptive-copy';
    this._nodes = document.querySelectorAll('[data-da]');

    this._nodes.forEach((node) => {
      const data = node.dataset.da.trim();
      const dataArray = data.split(',');
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destination = document.querySelector(dataArray[0].trim());
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : this._baseWindowWidth;
      object.place = dataArray[2] ? dataArray[2].trim() : 'last';
      object.index = this._indexInParent(object.parent, object.element);
      object.action = dataArray[3] ? dataArray[3].trim() : 'move'; // move | copy
      object.copyClass = dataArray[4] ? dataArray[4].trim() : null; // дополнительный класс для копии
      this._objectsArray.push(object);
    });

    this._arraySort();

    this._mediaQueries = this._objectsArray.map(
      (item) => `(${this.type}-width: ${item.breakpoint}px),${item.breakpoint}`
    );
    this._mediaQueries = this._mediaQueries.filter(
      (item, index) => this._mediaQueries.indexOf(item) === index
    );

    this._mediaQueries.forEach((media) => {
      const mediaSplit = String(media).split(',');
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];

      const objectsFilter = this._objectsArray.filter(
        (item) => item.breakpoint === mediaBreakpoint
      );

      matchMedia.addListener(() => {
        this._mediaHandler(matchMedia, objectsFilter);
      });
      this._mediaHandler(matchMedia, objectsFilter);
    });
  }

  _mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.action === 'copy') {
          if (!object.destination) {
            return;
          }

          const newCopy = object.element.cloneNode(true);
          newCopy.classList.add(this._daCopyClassName);
          if (object.copyClass) {
            object.copyClass.split(' ').forEach((cls) => newCopy.classList.add(cls));
          }
          this._moveTo(object.place, newCopy, object.destination);
        } else {
          object.index = this._indexInParent(object.parent, object.element);
          this._moveTo(object.place, object.element, object.destination);
        }
      });
      return;
    }

    // если брейкпоинт НЕ совпадает
    objects.forEach((object) => {
      if (object.action === 'move' && object.element.classList.contains(this._daClassName)) {
        this._moveBack(object.parent, object.element, object.index);
      }
      if (object.action === 'copy' && object.destination) {
        // удаляем все копии для всех элементов на этом destination
        object.destination.querySelectorAll(`.${this._daCopyClassName}`).forEach((copy) => copy.remove());
      }
    });
  }

  _moveTo(place, element, destination) {
    // добавляем класс только если это не копия
    if (!element.classList.contains(this._daCopyClassName)) {
      element.classList.add(this._daClassName);
    }

    if (place === 'last' || place >= destination.children.length) {
      destination.append(element);
      return;
    }
    if (place === 'first') {
      destination.prepend(element);
      return;
    }
    destination.children[place].before(element);
  }

  _moveBack(parent, element, index) {
    element.classList.remove(this._daClassName);
    if (parent.children[index]) {
      parent.children[index].before(element);
      return;
    }
    parent.append(element);
  }

  _indexInParent(parent, element) {
    return Array.from(parent.children).indexOf(element);
  }

  _arraySort() {
    if (this.type === 'min') {
      this._objectsArray.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === 'first' && b.place === 'last') {
            return -1;
          }
          if (a.place === 'last' && b.place === 'first') {
            return 1;
          }
          return a.place - b.place;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      this._objectsArray.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === 'first' && b.place === 'last') {
            return 1;
          }
          if (a.place === 'last' && b.place === 'first') {
            return -1;
          }
          return b.place - a.place;
        }
        return b.breakpoint - a.breakpoint;
      });
    }
  }
}
