const query = require('querystring');
const response = require('./response.js');

const drawings = [];
let jsonResponse;

// serves up art from all users
const art = (req, res, params) => {
  jsonResponse = {};
  jsonResponse.results = drawings;
  if (params.name) {
    const searchedName = params.name.trim().toLowerCase().replaceAll(' ', '');
    // console.log(drawings);
    jsonResponse.results = drawings.filter((drawing) => drawing.name.trim().toLowerCase().replaceAll(' ', '') === searchedName);
  }
  if (req.method === 'HEAD') {
    response.respond(res, 200, 'application/json', jsonResponse, false);
  } else {
    response.respond(res, 200, 'application/json', jsonResponse);
  }
};

// updates the artwork data
const post = (req, res) => {
  jsonResponse = {};
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });
  req.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);
    const postExists = drawings.filter((drawing) => drawing.name === bodyParams.name);
    if (postExists.length === 0) {
      drawings.push({
        img: bodyParams.img,
        cap: bodyParams.cap,
        name: bodyParams.name,
        date: bodyParams.date,
      });
      response.respond(res, 201, 'application/json', jsonResponse);
    } else {
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].img = bodyParams.img;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].cap = bodyParams.cap;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].name = bodyParams.name;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].date = bodyParams.date;
      response.respond(res, 204, 'application/json', jsonResponse, false);
    }
  });
};
module.exports = {
  art,
  post,
};
