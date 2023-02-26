const query = require('querystring');
const response = require('./response.js');

const drawings = [];
let jsonResponse;
const getArt = (res, params) => {
  jsonResponse = {};
  jsonResponse.results = drawings;
  if (params.name) {
    const searchedName = params.name.trim().toLowerCase().replaceAll(' ', '');
    jsonResponse.results = drawings.filter((drawing) => drawing.name.trim().toLowerCase().replaceAll(' ', '') === searchedName);
  }
  response.respond(res, 200, 'application/json', jsonResponse);
};
const postArt = (req, res) => {
  jsonResponse = {};
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });
  req.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);
    const post = drawings.filter((drawing) => drawing.name === bodyParams.name);
    if (post.length === 0) {
      console.log("creating");
      drawings.push({
        img: bodyParams.img,
        cap: bodyParams.cap,
        name: bodyParams.name,
        date: bodyParams.date,
      });
    } else {
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].img = bodyParams.img;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].cap = bodyParams.cap;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].name = bodyParams.name;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].date = bodyParams.date;
    }
    response.respond(res, 200, 'application/json', jsonResponse);
  });
};
module.exports = {
  getArt,
  postArt,
};
