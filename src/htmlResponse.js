const fs = require('fs');
const response = require('./response.js');

const getHome = (res) => {
  response.respond(res, 200, 'text/html', fs.readFileSync(`${__dirname}/../client/html/home.html`));
};
const getForm = (res) => {
  response.respond(res, 200, 'text/html', fs.readFileSync(`${__dirname}/../client/html/form.html`));
};
const getFormCSS = (res) => {
  response.respond(res, 200, 'text/css', fs.readFileSync(`${__dirname}/../client/css/form.css`));

}
const getHomeCSS = (res) => {
  response.respond(res, 200, 'text/css', fs.readFileSync(`${__dirname}/../client/css/home.css`));

}
module.exports = {
  getHome,
  getForm,
  getFormCSS,
  getHomeCSS
};
