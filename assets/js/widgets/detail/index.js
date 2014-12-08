var hyperglue = require('hyperglue');
var inherits = require('inherits');
var EventEmitter = require('wildemitter');
var fs = require('fs');
var observable = require('observable');
var insertCss = require('insert-css');
var Rating = require('../rating');
var Spinner = require('../spinner');
var bulk = require('bulk-require');
var player = bulk(__dirname + '/../playerapi', ['**/index.js']);

module.exports = Detail;
inherits(Detail, EventEmitter);

function Detail() {
  if (!(this instanceof Detail)) return new Detail();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
  this.listeners = {
    back: this.emit.bind(this, 'back')
  };
  EventEmitter.call(this);
}

Detail.prototype.appendTo = function appendTo(el, data) {
  if (this.el) return;
  this.player = player[data.type]();
  this.data = data;
  this.placeholder = el;
  this.el = el.appendChild(
    hyperglue(this.html, {
      '.video': {_html: data.embed || ''},
      '.duration': data.duration || '',
      '.author': {_html: data.author || ''},
      '.title': data.title || '',
      '.description': {_text: data.description || ''}
    })
  );

  this.spinner = Spinner();
  this.spinner.appendTo(this.el);
  this.spinner.start();

  this.player.start(this.el.querySelector('iframe'), data.id);

  this.player.on('ready', this.spinner.stop.bind(this.spinner));
  this.player.on('*', this.emit.bind(this, 'player'));

  this.rating = Rating();
  this.rating.appendTo(this.el.querySelector('.rating'), 3);

  this._eventListeners('addEventListener');
};

Detail.prototype._eventListeners = function eventListeners(method) {
  this.el.querySelector('.back')[method]('click', this.listeners.back);
};

Detail.prototype.reset = function reset() {
  this.remove();
  this.appendTo(this.placeholder, this.data);
};

Detail.prototype.remove = function remove() {
  if (!this.el) return;
  this.player.remove();
  this._eventListeners('removeEventListener');
  this.el.parentNode.removeChild(this.el);
  this.el = null;
};
