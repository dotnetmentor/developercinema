var levelup = require('levelup');
var leveldown = require('leveldown-prebuilt');
var xtend = require('xtend');

module.exports = Db;

function Db(opt) {
  var defaults = {
    valueEncoding: 'json',
    keyEncoding: 'json',
    db: leveldown
  };

  opt = xtend(defaults, opt);
  var path = opt.path;
  delete opt.path;

  var db = levelup(path, opt);

  return db;
}
