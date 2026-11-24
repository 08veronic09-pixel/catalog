const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const PORT = 3000;
const ROOT = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png'
};
// сжимаем только текст: картинки уже сжаты, их не ужать
function canCompress(type) {
  return type.startsWith('text/') || type.startsWith('application/json');
}
// как долго браузеру можно хранить файл
function cachePolicy(type) {
  if (type.startsWith('image/') || type.startsWith('font/')) {
    return 'public, max-age=86400';
  }
  return 'no-cache';
}


// отправляет ответ, по возможности сжатым
function send(req, res, data, type) {
  // отпечаток содержимого: меняется, только если изменился файл
  const hash = crypto.createHash('md5').update(data).digest('hex');
  const etag = '"' + hash + '"';
 if (req.headers['if-none-match'] === etag) {
  res.writeHead(304, {
    'ETag': etag,
    'Cache-Control': cachePolicy(type)
  });
  res.end();
  return;
}
  const headers = {
    'Content-Type': type,
    'ETag': etag,
    'Cache-Control': cachePolicy(type)
  };
 
  const accept = req.headers['accept-encoding'] || '';
 
  // маленькие ответы от сжатия только растут
  if (data.length < 1024) {
    res.writeHead(200, headers);
    res.end(data);
    return;
  }
 
  if (canCompress(type) && accept.includes('gzip')) {
    headers['Content-Encoding'] = 'gzip';
    headers['Vary'] = 'Accept-Encoding';
    res.writeHead(200, headers);
    res.end(zlib.gzipSync(data));
    return;
  }
 
  res.writeHead(200, headers);
  res.end(data);
}

const server = http.createServer(function (req, res) {
    // разбираем адрес на путь и параметры после знака вопроса
  const address = new URL(req.url, 'http://localhost');
  if (address.pathname === '/api/products') {
    //console.time('Ответ каталога');
    const file = path.join(__dirname, 'products.json');
    const all = JSON.parse(fs.readFileSync(file, 'utf8'));
     // оставляем только товары, подходящие под поиск
    let search = address.searchParams.get('search') || '';
    search = search.toLowerCase();
    const found = [];
 
    for (let i = 0; i < all.length; i++) {
      if (all[i].name.toLowerCase().includes(search)) {
        found.push(all[i]);
      }
    }

    // какую страницу и по сколько товаров просят
    const page = Number(address.searchParams.get('page')) || 1;
    let limit = Number(address.searchParams.get('limit')) || 20;
    limit = Math.min(limit, 50);
 
    // вырезаем нужный кусок
    const start = (page - 1) * limit;
    const items = found.slice(start, start + limit);
 
    const answer = {
      items: items,
      total: found.length,
      page: page,
      pages: Math.ceil(found.length / limit)
    };
 
    const body = Buffer.from(JSON.stringify(answer));
    send(req, res, body, 'application/json; charset=utf-8');
    //console.timeEnd('Ответ каталога');
    return;
  }
  // если запросили корень сайта, отдаём главную страницу
  let url = req.url;
    if (req.url === '/'){
      url = '/index.html';
  }
 
  const filePath = path.join(ROOT, url);
 
  // такого файла в папке public нет
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Файл не найден');
    return;
  }
 
  const data = fs.readFileSync(filePath);

 
  const ext = path.extname(filePath);
  const type = TYPES[ext] || 'text/plain';
 
  send(req, res, data, type);
});

server.listen(PORT, function () {
  console.log('Открой в браузере: http://localhost:' + PORT);
});

