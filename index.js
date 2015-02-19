var http       = require('http');
var routes     = require('./lib/routes');
var config     = require('./config');
var fontConfig = require('./fontello/config.json');
var mountFonts = require('fontello-mount');

var port = process.env.PORT || config.port;

mountFonts(fontConfig, start);

function start(err, fontello) {
  if (err) return console.error(err);
  routes.port = port;
  routes.fontello = fontello;
  var server = http.createServer(routes);
  server.listen(port, console.log.bind(console, 'running on http://localhost:%s', port));
}
