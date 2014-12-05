var browserify  = require('browserify');
var brfs        = require('brfs');
var bulkify     = require('bulkify');
var configify   = require('./configify');
var StreamCache = require('stream-cache');
var exorcist    = require('exorcist');

module.exports = serve;

var cache = {};

function serve(assetPath, name, opt) {
  var file = assetPath + '/js/' + name + '.js';
  if (cache[file]) return cache[file];

  cache[file] = new StreamCache();

  var mapFile = name + '.js.map.json';

  browserify({debug: true}).
    add(file).
    transform(configify).
    transform(brfs).
    transform(bulkify).
    bundle().
    pipe(exorcist(mapFile)).
    pipe(cache[file])
  ;

  return cache[file];
}
