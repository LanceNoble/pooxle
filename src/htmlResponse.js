const fs = require('fs');
const response = require('./response.js');

const getHome = (res) => {
  response.respond(res, 200, 'text/html', fs.readFileSync(`${__dirname}/../client/html/home.html`));
};
module.exports = {
  getHome,
};
