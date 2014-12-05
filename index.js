var http       = require('http');
var routes     = require('./lib/routes');
var config     = require('./config');

var port = process.env.PORT || config.port;

routes.port = port;

var server = http.createServer(routes).
  listen(port, running)
;

function running() {
  console.log('listening on http://localhost:' + port);
}
