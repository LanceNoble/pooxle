const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlResponse = require('./htmlResponse.js');
const jsonResponse = require('./jsonResponse.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const params = query.parse(parsedUrl.query);
  switch (parsedUrl.pathname) {
    case '/':
      htmlResponse.getHome(res);
      break;
    case '/art':
      jsonResponse.getArt(res, params);
      break;
    case '/post':
      jsonResponse.postArt(req, res);
      break;
    default:
      break;
  }
}).listen(port);
