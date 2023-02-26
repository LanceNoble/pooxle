const query = require('querystring');
const response = require('./response.js');

const drawings = {};
const getArt = (res) => {
  const responseJSON = { drawings };
  response.respond(res, 200, 'application/json', responseJSON);
};
const postArt = (req, res) => {
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });
  req.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);
    drawings[bodyParams.name] = {};
    drawings[bodyParams.name].img = bodyParams.img;
    drawings[bodyParams.name].name = bodyParams.name;
    response.respond(res, 200, 'application/json', drawings);
  });
};
module.exports = {
  getArt,
  postArt,
};
