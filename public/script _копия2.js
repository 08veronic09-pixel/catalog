setInterval(function () {
const now = new Date();
const ms = String(now.getMilliseconds()).padStart(3, '0');
document.getElementById('clock').textContent =
now.toLocaleTimeString() + '.' + ms;
}, 50);


fetch('/api/products')
.then(function (response) {
return response.json();
})
.then(function (products) {
showCards(products);
showCardsFragment(products);
fixHeights();
});

function showCards(products) {
const totalBox = document.getElementById("total");

console.time('Построение карточек');
const total = products.length;
const start = performance.now();

// находим контейнер, куда вставлять карточки
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
'<p class="price">$' + item.price + '</p>' +
'<button class="btn-primary">В корзину</button>' +
'<button>В корзину</button>' +
'</article>';
}

// вставляем всё разом
box.innerHTML = html;
const timeCardsCreat = Math.round(performance.now() - start);

totalBox.textContent = 'Всего товаров: ${total}. Построены за ${timeCardsCreat}ms'

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
