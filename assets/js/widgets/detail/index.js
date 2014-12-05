var hyperglue = require('hyperglue');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var observable = require('observable');
var insertCss = require('insert-css');
var Rating = require('../rating');

module.exports = Detail;
inherits(Detail, EventEmitter);

function Detail() {
  if (!(this instanceof Detail)) return new Detail();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
  this.listeners = {
    back: this.emit.bind(this, 'back')
  };
}

Detail.prototype.appendTo = function appendTo(el, data) {
  this.data = data;
  this.el = el.appendChild(
    hyperglue(this.html, {
      '.video': {_html: data.embed || ''},
      '.duration': data.duration || '',
      '.author': {_html: data.author || ''},
      '.title': data.title || '',
      '.description': data.description || ''
    })
  );

  this.rating = Rating();
  this.rating.appendTo(this.el.querySelector('.rating'), 3);

  this._eventListeners('addEventListener');
};

Detail.prototype._eventListeners = function eventListeners(method) {
  this.el.querySelector('.back')[method]('click', this.listeners.back);
};

Detail.prototype.remove = function remove() {
  if (!this.el) return;
  this._eventListeners('removeEventListener');
  this.el.parentNode.removeChild(this.el);
  this.el = null;
};
