const query = require('querystring');
const response = require('./response.js');

const drawings = [];

// helper function to make sure the name param only has letters and numbers
function checkName(name) {
  let validChar = true;
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    // console.log(code);
    if (code >= 48 && code <= 57) {
      validChar = true;
    } else if (code >= 65 && code <= 90) {
      validChar = true;
    } else if (code >= 97 && code <= 122) {
      validChar = true;
    } else {
      return false;
    }
  }
  return validChar;
}

// serves up art from all users
const art = (req, res, params) => {
  const jsonResponse = {};
  jsonResponse.results = drawings;
  if (params.name) {
    if (!checkName(params.name)) {
      response.respond(res, 400, 'application/json');
      return;
    }
    jsonResponse.results = drawings.filter((drawing) => drawing.name === params.name);
  }
  if (req.method === 'HEAD') {
    response.respond(res, 200, 'application/json');
  } else {
    response.respond(res, 200, 'application/json', jsonResponse);
  }
};

// updates the artwork data
const post = (req, res) => {
  const body = [];
  req.on('data', (chunk) => {
    body.push(chunk);
  });
  req.on('end', () => {
    const bodyString = Buffer.concat(body).toString();
    const bodyParams = query.parse(bodyString);
    // check to see if body params name only contains letters and numbers
    // console.log(bodyParams.name);
    if (!checkName(bodyParams.name)) {
      response.respond(res, 400, 'application/json');
      return;
    }
    const postExists = drawings.filter((drawing) => drawing.name === bodyParams.name);
    if (postExists.length === 0) {
      drawings.push({
        img: bodyParams.img,
        cap: bodyParams.cap,
        name: bodyParams.name,
        date: bodyParams.date,
      });
      response.respond(res, 201, 'application/json');
    } else {
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].img = bodyParams.img;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].cap = bodyParams.cap;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].name = bodyParams.name;
      drawings[drawings.findIndex((e) => e.name === bodyParams.name)].date = bodyParams.date;
      response.respond(res, 204, 'application/json');
    }
  });
};
module.exports = {
  art,
  post,
};
