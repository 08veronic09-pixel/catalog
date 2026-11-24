setInterval(function () {
const now = new Date();
const ms = String(now.getMilliseconds()).padStart(3, '0');
document.getElementById('clock').textContent =
now.toLocaleTimeString() + '.' + ms;
}, 50);
// весь каталог, полученный с сервера
let allProducts = [];
 
// счётчики для панели справа внизу
let filterRuns = 0;
let scrollRuns = 0;
let cartCount = 0;
// сколько товаров просим за раз
const LIMIT = 20;
 
// какая страница уже загружена и сколько их всего
let page = 0;
let pages = 1;
 
// идёт ли сейчас загрузка
let loading = false;
 
// загружает следующую страницу и дописывает её карточки
function loadMore() {
  if (loading || page >= pages) {
    return;
  }
 
  loading = true;
  page = page + 1;
 
  const text = document.querySelector('#search').value;
  const address = '/api/products?page=' + page + '&limit=' + LIMIT +
                  '&search=' + encodeURIComponent(text);

 
  fetch(address)
    .then(function (response) {
      return response.json();
    })
    .then(function (answer) {
      pages = answer.pages;
      addCards(answer.items);
      fixHeights();
 
      const shown = document.querySelectorAll('.card').length;
      document.querySelector('#total').textContent =
        'Найдено: ' + answer.total + ', показано: ' + shown;
 
      const count = document.querySelectorAll('*').length;
      document.querySelector('#nodes').textContent =
        'Элементов на странице: ' + count;
      if (page >= pages) {
        document.querySelector('#more').style.display = 'none';
      }
      loading = false;
    });
}
 
// первая страница при открытии сайта
loadMore();


fetch('/api/products')
.then(function (response) {
return response.json();
})
.then(function (products) {
allProducts = products;
showCards(products);
//showCardsFragment(products);
fixHeights();

});
// начинает каталог заново с первой страницы, уже с учётом поиска
function filterCards() {
  filterRuns = filterRuns + 1;
  document.querySelector('#filterRuns').textContent =
    'Поиск запускался: ' + filterRuns;
 
  document.querySelector('.cards').innerHTML = '';
  document.querySelector('#more').style.display = 'block';
  page = 0;
  pages = 1;
 
  loadMore();
}

// дописывает карточки в конец каталога
function addCards(products) {
  console.time('Построение карточек');
 
  const box = document.querySelector('.cards');
  let html = '';
 
  // собираем разметку для каждого товара
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
 
    html = html +
      '<article class="card">' +
        '<img src="' + item.img + '" alt="' + item.name + '"' +
             ' width="600" height="450" loading="lazy">' +
        '<h2>' + item.name + '</h2>' +
        '<p class="price">' + item.price + ' руб.</p>' +
        '<button class="btn-primary" data-id="' + item.id + '">' +
          'В корзину</button>' +
      '</article>';
  }
 
  // дописываем всё разом, не трогая уже показанные карточки
  box.insertAdjacentHTML('beforeend', html);
 
  console.timeEnd('Построение карточек');
}


function fixHeights() {
console.time('Высота карточек');

const cards = document.querySelectorAll('.card');
const heights = [];

for (let i = 0; i < cards.length; i++) {
heights.push(cards[i].offsetHeight);
}

for (let i = 0; i < heights.length; i++) {
cards[i].style.minHeight = heights[i] + 'px';
}

console.timeEnd('Высота карточек');
}
// то же самое, но через невидимый контейнер
function showCardsFragment(products) {
  console.time('Построение через фрагмент');
 
  const box = document.querySelector('.cards');
  box.innerHTML = '';
 
  const fragment = document.createDocumentFragment();
 
  for (let i = 0; i < products.length; i++) {
    const item = products[i];
 
    const card = document.createElement('article');
    card.className = 'card';
 
    const img = document.createElement('img');
    img.src = item.img;
    img.alt = item.name;
    img.width = 600;
    img.height = 450;
    img.loading = 'lazy';
 
    const name = document.createElement('h2');
    name.textContent = item.name;
 
    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = item.price + ' руб.';
 
    card.append(img, name, price);
    fragment.appendChild(card);
  }
 
  box.appendChild(fragment);
 
  console.timeEnd('Построение через фрагмент');
}
// оставляет только товары, в названии которых есть введённый текст
function filterCards() {
  filterRuns = filterRuns + 1;
  document.querySelector('#filterRuns').textContent =
    'Поиск запускался: ' + filterRuns;
 
  const text = document.querySelector('#search').value.toLowerCase();
  const found = [];
 
  for (let i = 0; i < allProducts.length; i++) {
    if (allProducts[i].name.toLowerCase().includes(text)) {
      found.push(allProducts[i]);
    }
  }
 
  showCards(found);
}
// ждём паузу в наборе и только потом ищем
let searchTimer;
document.querySelector('#search').addEventListener('input', function () {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(filterCards, 300);
});
// показывает кнопку «Наверх», когда страница прокручена вниз
function onScroll() {
  scrollRuns = scrollRuns + 1;
  document.querySelector('#scrollRuns').textContent =
    'Прокрутка обработана: ' + scrollRuns;
 
  const up = document.querySelector('#up');
 
  if (window.scrollY > 1000) {
    up.style.display = 'block';
  } else {
    up.style.display = 'none';
  }
}
// пропускаем вызовы, если с прошлого прошло меньше 200 мс
let lastScroll = 0;
window.addEventListener('scroll', function () {
  const now = Date.now();
 
  if (now - lastScroll < 200) {
    return;
  }
 
  lastScroll = now;

  onScroll();
});
// находим кнопку «Наверх»
const upButton = document.querySelector('#up');

// вешаем обработчик клика
upButton.addEventListener('click', function () {
  // прокручиваем страницу в левый верхний угол
  window.scrollTo(0, 0);
});
// кладёт товар в корзину
function addToCart(id) {
  cartCount = cartCount + 1;
  document.querySelector('#cart').textContent = 'В корзине: ' + cartCount;
  console.log('Добавлен товар № ' + id);
}
// подключает обработчик к каждой кнопке
function bindButtons() {
  const buttons = document.querySelectorAll('.btn-primary');
 
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      addToCart(buttons[i].dataset.id);
    });
  }
 
  document.querySelector('#handlers').textContent =
    'Обработчиков кнопок: ' + buttons.length;
}


// один обработчик на весь каталог
document.querySelector('.cards').addEventListener('click', function (event) {
  if (event.target.classList.contains('btn-primary')) {
    addToCart(event.target.dataset.id);
  }
});
 
document.querySelector('#handlers').textContent = 'Обработчиков кнопок: 1';
// кнопка «Показать ещё»
document.querySelector('#more').addEventListener('click', function () {
  loadMore();
});
// кнопка показалась на экране: загружаем следующую страницу
const watcher = new IntersectionObserver(function (entries) {
  if (entries[0].isIntersecting) {
    loadMore();
  }
}, { rootMargin: '300px' });
 
watcher.observe(document.querySelector('#more'));
// раз в секунду считаем, какие файлы пришли по сети, а какие из кеша
setInterval(function () {
  const files = performance.getEntriesByType('resource');
  let fromCache = 0;
  let bytes = 0;
 
  for (let i = 0; i < files.length; i++) {
    bytes = bytes + files[i].transferSize;
 
    if (files[i].transferSize === 0) {
      fromCache = fromCache + 1;
    }
  }
 
  document.querySelector('#fromCache').textContent =
    'Из кеша: ' + fromCache + ' из ' + files.length;
  document.querySelector('#loaded').textContent =
    'Скачано: ' + Math.round(bytes / 1024) + ' кБ';
}, 1000);
