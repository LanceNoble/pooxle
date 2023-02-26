const respond = (res, stat, mime, stuff) => {
  res.writeHead(stat, { 'Content-Type': `${mime}` });
  let jsonResponse = stuff;
  if (mime === 'application/json') {
    jsonResponse = JSON.stringify(stuff);
  }
  res.write(jsonResponse);
  res.end();
};
module.exports = { respond };
