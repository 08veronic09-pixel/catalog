// просим у сервера данные
fetch('/api/products')
  .then(function (response) {
    return response.json();
  })
  .then(function (products) {
    showCards(products);
  });
function showCards(products) {
 
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
        '<p class="price">' + item.price + ' руб.</p>' +
        '<button>В корзину</button>' +
      '</article>';
  }
 
  // вставляем всё разом
  box.innerHTML = html;
}
