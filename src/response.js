// generic helper function for responding to requests
const respond = (res, stat, mime, stuff) => {
  res.writeHead(stat, { 'Content-Type': `${mime}` });
  let response;
  if (stuff) {
    response = stuff;
    if (mime === 'application/json') {
      response = JSON.stringify(stuff);
    }
    res.write(response);
  }
  res.end();
};
module.exports = { respond };
