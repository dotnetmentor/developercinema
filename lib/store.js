var config = require('../config');
var levelup = require('levelup');
var leveldown = require('leveldown');
var levelsession = require('level-session');
var accountdown = require('accountdown');
var basic = require('accountdown-basic');

module.exports = store;

function store() {
  var expire = 60 * 60 * 24 * 7 * 2 * 1000;
  return {
    users: accountdown(db('account'), {login: {basic: basic}}),
    session: levelsession({db: db('session'), keys: config.keygrip.keys, expire: expire}),
    db: db('store')
  };
}

function db(path) {
  var opt = {
    valueEncoding: 'json',
    keyEncoding: 'json',
    db: leveldown,
  };
  return levelup(path, opt);
}
