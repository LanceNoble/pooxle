const http = require('http');
const url = require('url');
const query = require('querystring');

const htmlResponse = require('./htmlResponse.js');
const jsonResponse = require('./jsonResponse.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

http.createServer((req, res) => {
  switch (req.url) {
    case '/':
      htmlResponse.getHome(res);
      break;
    case '/getArt':
      jsonResponse.getArt(res);
      break;
    case '/form':
      htmlResponse.getForm(res);
      break;
    case '/addDrawing':
      jsonResponse.postArt(req, res);
      break;
    case "/getHomeCSS":
      htmlResponse.getHomeCSS(res);
      break;
    case "/getFormCSS":
      htmlResponse.getFormCSS(res);
      break;
    default:
      break;
  }
}).listen(port);
