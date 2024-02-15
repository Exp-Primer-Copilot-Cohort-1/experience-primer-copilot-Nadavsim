// Create web server
var http = require('http');
var url = require('url');
var fs = require('fs');
var comments = require('./comments');
var querystring = require('querystring');
var path = require('path');
var mime = require('mime');

var server = http.createServer(function(req, res) {
  var pathname = url.parse(req.url).pathname;
  var query = url.parse(req.url).query;
  if (pathname === '/post') {
    var data = '';
    req.on('data', function(chunk) {
      data += chunk;
    });
    req.on('end', function() {
      console.log(data);
      var comment = querystring.parse(data);
      comments.push(comment);
      res.writeHead(200, {'Content-Type': 'text/plain'});
      res.end('success');
    });
  } else if (pathname === '/get') {
    var callback = querystring.parse(query).callback;
    var str = callback + '(' + JSON.stringify(comments) + ')';
    res.writeHead(200, {'Content-Type': 'text/javascript'});
    res.end(str);
  } else {
    var filepath = path.join(__dirname, pathname);
    fs.exists(filepath, function(exists) {
      if (exists) {
        res.writeHead(200, {'Content-Type': mime.lookup(filepath)});
        fs.createReadStream(filepath).pipe(res);
      } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('404 Not Found');
      }
    });
  }
});

server.listen(3000);
console.log('Server is running at http://