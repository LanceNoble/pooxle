// generic helper function for responding to requests
const respond = (res, stat, mime, stuff, write = true) => {
  res.writeHead(stat, { 'Content-Type': `${mime}` });
  let response = stuff;
  if (mime === 'application/json') {
    response = JSON.stringify(stuff);
  }
  if (write) {
    res.write(response);
  }
  res.end();
};
module.exports = { respond };
