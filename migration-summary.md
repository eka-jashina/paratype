# Миграция Paratype: Vite/Handlebars → Astro 6

## Содержание

1. [Миграция на Astro 6 + Vite 7](#1-миграция-на-astro-6--vite-7)
2. [Линтинг и форматирование](#2-линтинг-и-форматирование)
3. [Удаление TypeScript из компонентов](#3-удаление-typescript-из-компонентов)
4. [Автоматическая генерация sitemap](#4-автоматическая-генерация-sitemap)
5. [SVG-спрайт с currentColor](#5-svg-спрайт-с-currentcolor)
6. [Оптимизация изображений через astro:assets](#6-оптимизация-изображений-через-astroassets)
7. [SCSS: @use вместо @import](#7-scss-use-вместо-import)
8. [camelCase ключи в JSON](#8-camelcase-ключи-в-json)
9. [Content Collections с Zod-валидацией](#9-content-collections-с-zod-валидацией)
10. [Общая картина](#общая-картина)

---

## 1. Миграция на Astro 6 + Vite 7

**Было:** Vite с ручной конфигурацией (`vite.config.js` — 82 строки), Handlebars-шаблоны (`.hbs`), ручная сборка HTML.

**Стало:** Astro 6 с файловым роутингом, `.astro`-компоненты, встроенный Vite 7.

### Почему хорошо

- Astro генерирует статический HTML без клиентского JS по умолчанию — страницы легче и быстрее.
- Файловый роутинг: `src/pages/index.astro` → `/`, `src/pages/404.astro` → `/404` — не нужно настраивать маршруты вручную.
- Компонентная модель вместо partials: каждый `.astro`-файл — самодостаточный компонент с логикой, разметкой и стилями.
- Встроенная оптимизация CSS, JS, изображений — не нужны отдельные плагины.

### Структура проекта

```
src/
  pages/         — маршруты (index.astro, 404.astro)
  layouts/       — Base.astro (общая обёртка: <head>, шрифты, стили)
  components/    — Header, Footer, NewFontCard, Catalog и т.д.
  styles/        — SCSS (без изменений в архитектуре)
  scripts/       — JS (без изменений)
  assets/        — картинки для оптимизации Astro
  data/          — JSON с данными
public/          — статика (шрифты, фавиконы, спрайт, баннеры)
```

### Как пользоваться

```bash
npm run dev       # dev-сервер на порту 3000
npm run build     # сборка в dist/
npm run preview   # предпросмотр сборки
```

### Ограничения

- Astro по умолчанию не отправляет JS в браузер. Интерактивные компоненты (React/Vue/Svelte) нужно явно помечать директивой `client:*`.
- Сейчас весь JS подключён через обычный `<script>` — работает как и раньше.

---

## 2. Линтинг и форматирование

### Что добавлено

- **ESLint** (`eslint@8` + `eslint-config-htmlacademy`) — для JS и `.astro`-файлов.
- **Stylelint** (`stylelint@16` + `stylelint-config-standard-scss` + `stylelint-selector-bem-pattern`) — для SCSS с проверкой BEM.
- **Prettier** (`prettier@3` + `prettier-plugin-astro`) — единый стиль кода.
- **Browserslist** (`.browserslistrc`) — целевые браузеры для autoprefixer.

### Конфигурации

- `.eslintrc.yml` — YAML вместо JSON (нагляднее для вложенных правил).
- `.stylelintrc.json` — минимальная конфигурация, наследует htmlacademy-конфиги.
- `.prettierrc` — `singleQuote: true`, `printWidth: 120`, `trailingComma: "all"`.

### Как пользоваться

```bash
npm run lint          # ESLint + Stylelint
npm run lint:js       # только JS
npm run lint:css      # только SCSS
npm run format        # Prettier — исправить
npm run format:check  # Prettier — только проверить
```

### Особенности

- Prettier и ESLint не конфликтуют — Prettier занимается форматированием, ESLint — логикой.
- `prettier-plugin-astro` понимает frontmatter (`---`) в `.astro`-файлах.
- `astro-eslint-parser` позволяет ESLint парсить `.astro`.

---

## 3. Удаление TypeScript из компонентов

**Было:** Astro по умолчанию поддерживает TS, в компонентах были TS-артефакты.

**Стало:** Чистый JavaScript во всех `.astro`-компонентах.

Проект изначально был на JS, TypeScript не использовался осмысленно. `tsconfig.json` остался минимальный — он нужен Astro для резолва путей и JSX.

### Ограничения

Автокомплит в IDE будет слабее без типов. Компенсируется Zod-валидацией через Content Collections (см. [п.9](#9-content-collections-с-zod-валидацией)).

---

## 4. Автоматическая генерация sitemap

Добавлен плагин `@astrojs/sitemap`. При `npm run build` создаёт `dist/sitemap-index.xml` на основе всех страниц в `src/pages/`.

Домен берётся из `site: 'https://paratype.ru'` в `astro.config.mjs`.

### Ограничения

Пока `robots.txt` не содержит ссылку на sitemap — поисковые роботы его не найдут автоматически.

---

## 5. SVG-спрайт с currentColor

**Было:** SVG-иконки в `source/img/sprite/` с захардкоженными цветами.

**Стало:** `public/sprite.svg` — единый спрайт, все `fill`/`stroke` заменены на `currentColor`.

### Почему хорошо

- Цвет иконки наследуется от CSS `color` родителя — не нужно дублировать SVG для разных цветов.
- Тёмная тема меняет цвет иконок автоматически через CSS.

### Как пользоваться

```html
<svg width="24" height="24" viewBox="0 0 24 24">
  <use href="/sprite.svg#favorites"></use>
</svg>
```

Цвет задаётся через CSS: `.icon { color: red; }` → иконка станет красной.

### Особенности

- Мы сначала попробовали `astro-icon` (инлайновые SVG), но откатились — спрайт лучше кешируется браузером (один файл на все страницы).
- В спрайте добавлены `<view>` элементы — это позволяет использовать иконки как CSS `background-image` через `url("/sprite.svg#burger-view")`.

### Ограничения

- `currentColor` работает только с `fill`/`stroke`. Если иконка многоцветная — `currentColor` не подойдёт.
- Спрайт загружается отдельным HTTP-запросом (но кешируется).

---

## 6. Оптимизация изображений через astro:assets

**Было:** Все картинки в `source/img/` — вручную подготовленные 1x, 2x, WebP и JPEG версии (54+ файлов для шрифтовых карточек).

**Стало:** В `src/assets/img/content/fonts/` остались только `@2x.jpg` исходники (18 файлов). Все варианты генерируются автоматически.

### a) `<Image>` для простых случаев

В `Header.astro` и `CatalogSectionCard.astro`:

```astro
---
import { Image } from 'astro:assets';
import logo from '../assets/img/content/paratype-logo-desktop.svg';
---

<Image src={logo} alt="Paratype" />
```

Astro автоматически добавляет `width`, `height`, оптимизирует формат.

### b) `getImage()` для сложных responsive-картинок

В `NewFontCard.astro` — из одного `@2x.jpg` генерируются 4 варианта:

```js
const [webp2x, webp1x, jpg2x, jpg1x] = await Promise.all([
  getImage({ src, format: 'webp' }),
  getImage({ src, format: 'webp', width: width1x }),
  getImage({ src, format: 'jpg' }),
  getImage({ src, format: 'jpg', width: width1x }),
]);
```

Результат в HTML — полноценный `<picture>` с `<source>` для WebP/JPEG, desktop/mobile, 1x/2x.

### Почему хорошо

- Один исходник вместо 6 файлов на картинку.
- Astro кеширует результат — повторные сборки мгновенные.
- Гарантированные `width`/`height` — нет layout shift (CLS = 0).
- Формат и размер рассчитываются правильно — нет человеческих ошибок.

### Как добавить новый шрифт

1. Положить `name-desktop-{1,2,3}@2x.jpg` и `name-mobile-{1,2,3}@2x.jpg` в `src/assets/img/content/fonts/`.
2. Добавить запись в `src/data/new-font-cards.json` с `"picture": "name"`.
3. Готово — 4 формата × 3 слайда × 2 размера = 24 варианта сгенерируются автоматически.

### Ограничения

- Картинки в `src/assets/` получают хеш в имени (`image.B9UO73-x.jpg`) — нельзя ссылаться по фиксированному URL.
- Баннерные фоны (`public/img/decor/banners/`) пока не мигрированы — они подключаются через CSS `background-image`, что требует другого подхода.

---

## 7. SCSS: @use вместо @import

**Было:** Старый `@import` (deprecated в Dart Sass).

**Стало:** Все файлы используют `@use '../common' as *;`.

### Почему хорошо

- `@import` будет удалён в будущих версиях Sass.
- `@use` не загрязняет глобальное пространство — переменные и миксины доступны только в файле, где подключены.
- `@forward` в `_index.scss` позволяет реэкспортировать — подключаешь одну папку, получаешь всё.

### Особенности

- `@use '../common' as *;` — `as *` убирает неймспейс, чтобы не писать `common.$color-main` везде.
- `src/styles/common/_index.scss` использует `@forward` для variables, mixins, functions.

---

## 8. camelCase ключи в JSON

**Было:**

```json
{ "filter-category": "sale", "count-all": "280", "default-open-on-mobile": false }
```

В компонентах: `props['filter-category']` — неудобно, легко опечататься.

**Стало:**

```json
{ "filterCategory": "sale", "countAll": "280", "defaultOpenOnMobile": false }
```

В компонентах — чистая деструктуризация:

```js
const { modifier = '', filterCategory, categoryDetails, defaultOpenOnMobile, picture: pic, ...props } = Astro.props;
```

### Почему хорошо

- Стандартное именование для JavaScript.
- Деструктуризация вместо обращения по строковому ключу.
- Ошибки видны сразу (нет скрытых `undefined`).

---

## 9. Content Collections с Zod-валидацией

**Было:** Прямой `import data from '../data/file.json'` — никакой валидации, опечатка молча рендерится как `undefined`.

**Стало:** `src/content.config.js` с тремя коллекциями и Zod-схемами.

### Как устроено

```js
// src/content.config.js
import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

const fontCards = defineCollection({
  loader: file('src/data/new-font-cards.json'),
  schema: z.object({
    modifier: z.string().optional(),
    defaultOpenOnMobile: z.boolean(),
    title: z.string(),
    filterCategory: z.string(),
    tags: z.array(z.string()),
    // ...
  }),
});

export const collections = { fontCards, banners, catalogSections };
```

Компоненты используют `getCollection()`:

```js
import { getCollection } from 'astro:content';
const newFonts = await getCollection('fontCards');
```

### Почему хорошо

- Если в JSON пропущено обязательное поле — сборка падает с понятной ошибкой Zod, а не молча рендерит пустоту.
- Если тип неверный (строка вместо boolean) — тоже ошибка при сборке.
- `optional()` явно маркирует необязательные поля — видно, что можно пропустить.

### Как добавить новую коллекцию

1. Создать JSON-файл в `src/data/` — каждый объект должен иметь поле `id`.
2. Описать коллекцию в `content.config.js` с `file()` loader и Zod-схемой.
3. Добавить в `export const collections = { ... }`.

### Как пользоваться в компонентах

`getCollection()` возвращает массив `{ id, data }`. Передача в дочерний компонент:

```astro
{entries.map((entry) => (
  <Component {...entry.data} />
))}
```

### Ограничения

- Каждый объект в массиве JSON обязан иметь поле `id` — это требование `file()` loader.
- `getCollection()` — асинхронный, работает только в frontmatter `.astro`-файлов (серверный код).
- Без TypeScript нет автокомплита по полям `data` в IDE — но валидация при сборке работает полноценно.

---

## Общая картина

| До | После |
|---|---|
| Vite + Handlebars + ручная сборка | Astro 6 с файловым роутингом |
| `.hbs` partials | `.astro` компоненты с логикой |
| 54+ вручную нарезанных картинки | 18 исходников → авто-генерация |
| Нет линтинга | ESLint + Stylelint + Prettier |
| `@import` (deprecated) | `@use` / `@forward` |
| Захардкоженные цвета в SVG | `currentColor` в спрайте |
| `props['kebab-key']` | Деструктуризация camelCase |
| Прямой import JSON | Content Collections + Zod |
