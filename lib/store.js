var config = require('../config');
var levelup = require('levelup');
var leveldown = require('leveldown-prebuilt');
var levelsession = require('level-session');
var accountdown = require('accountdown');
var basic = require('accountdown-basic');

module.exports = store;

function store() {
  return {
    users: accountdown(db('account'), {login: {basic: basic}}),
    session: levelsession({db: db('session'), keys: config.keygrip.keys}),
    store: db('store')
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
