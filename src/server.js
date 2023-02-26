const http = require('http');

const htmlResponse = require('./htmlResponse.js');
const jsonResponse = require('./jsonResponse.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

http.createServer((req, res) => {
  switch (req.url) {
    case '/':
      htmlResponse.getHome(res);
      break;
    case '/art':
      jsonResponse.getArt(res);
      break;
    case '/post':
      jsonResponse.postArt(req, res);
      break;
    default:
      break;
  }
}).listen(port);
