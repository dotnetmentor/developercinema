var domify = require('domify');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var insertCss = require('insert-css');

module.exports = Logout;
inherits(Logout, EventEmitter);

function Logout() {
  if (!(this instanceof Logout)) return new Logout();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
}

Logout.prototype.appendTo = function appendTo(el, data) {
  this.el = el.appendChild(domify(this.html));
};
