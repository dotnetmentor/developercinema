var insertCss    = require('insert-css');
var domify       = require('domify');
var fs           = require('fs');

module.exports = Spinner;

function Spinner() {
  if (!(this instanceof Spinner)) return new Spinner();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
}

Spinner.prototype.appendTo = function appendTo(el) {
  this.placeholder = el;
};

Spinner.prototype.start = function start() {
  if (this.el) return this;
  this.el = this.placeholder.appendChild(domify(this.html));
  return this;
};

Spinner.prototype.stop = function stop() {
  if (!this.el) return;
  this.el.parentNode.removeChild(this.el);
  this.el = null;
};
