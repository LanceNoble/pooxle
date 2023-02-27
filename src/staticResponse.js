const fs = require('fs');
const response = require('./response.js');

// serves up static files in client folder
const home = (res) => response.respond(res, 200, 'text/html', fs.readFileSync(`${__dirname}/../client/html/home.html`));
const notFound = (res) => response.respond(res, 404, 'text/html', fs.readFileSync(`${__dirname}/../client/html/notFound.html`));
const css = (res) => response.respond(res, 200, 'text/css', fs.readFileSync(`${__dirname}/../client/home.css`));
const js = (res) => response.respond(res, 200, 'text/javascript', fs.readFileSync(`${__dirname}/../client/home.js`));

module.exports = {
  home,
  notFound,
  css,
  js,
};
