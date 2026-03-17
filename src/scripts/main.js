import {initDynamicAdaptive} from './modules/dynamic-adaptive/init-dynamic-adaptive';
import './modules/burger';
import {activateSliders} from './modules/sliders';
import {dragScroll} from './modules/scroll-container';
import './modules/filters/filters-menu';
import {initFilter} from './modules/filters/init-filters';
import './modules/scroll-to-top';

window.addEventListener('DOMContentLoaded', () => {
  window.addEventListener('load', () => {
    initDynamicAdaptive();
    activateSliders();
  });

  window.addEventListener('resize', activateSliders);

  dragScroll();

  initFilter('.new-fonts__category', '.new-fonts__item', '.new-font-card');
});
