var domify = require('domify');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var observable = require('observable');
var insertCss = require('insert-css');

module.exports = Search;
inherits(Search, EventEmitter);

function Search() {
  if (!(this instanceof Search)) return new Search();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
}

Search.prototype.appendTo = function appendTo(el, data) {
  this.el = el.appendChild(domify(this.html));
  this.el.querySelector('.search').addEventListener('click', this._show.bind(this), false);
  this.inputEl = this.el.querySelector('input');
  this.inputEl.addEventListener('blur', this._hide.bind(this));
  this.input = observable.input(this.inputEl, 'value', 'change');
  this.input(this.search.bind(this));
};

Search.prototype._show = function show() {
  this.input('');
  this.inputEl.focus();
  this.inputEl.classList.add('show');
};

Search.prototype._hide = function hide() {
  this.inputEl.classList.remove('show');
  if (document.activeElement === this.inputEl) {
    this.inputEl.blur();
  }
};

Search.prototype.search = function search(value) {
  if (value) this.emit('search', value);
  this._hide();
};
