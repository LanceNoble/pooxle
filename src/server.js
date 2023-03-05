const http = require('http');
const url = require('url');
const query = require('querystring');

const staticResponse = require('./staticResponse.js');
const jsonResponse = require('./jsonResponse.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  const params = query.parse(parsedUrl.query);
  switch (parsedUrl.pathname) {
    case '/':
      staticResponse.home(res);
      break;
    case '/js':
      staticResponse.js(res);
      break;
    case '/art':
      jsonResponse.art(req, res, params);
      break;
    case '/post':
      jsonResponse.post(req, res);
      break;
    default:
      staticResponse.notFound(res);
      break;
  }
}).listen(port);
