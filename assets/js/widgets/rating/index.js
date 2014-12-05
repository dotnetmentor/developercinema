var Rating = require('rating');

var insertCss = require('insert-css');
var inherits = require('inherits');
var domify = require('domify');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var observable = require('observable');

module.exports = RatingWidget;
inherits(RatingWidget, EventEmitter);

function RatingWidget() {
  if (!(this instanceof RatingWidget)) return new RatingWidget();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
}

RatingWidget.prototype.appendTo = function appendTo(el, rating) {
  this.el = domify(this.html);

  var rating = new Rating([1, 2, 3, 4, 5]);

  rating.set(rating || 0);
  rating.on('rate', this.emit.bind(this, 'rate'));

  this.el.appendChild(rating.el);
  el.appendChild(this.el);
};

RatingWidget.prototype.remove = function remove() {
  if (!this.el) return;
  this.el.parentNode.removeChild(this.el);
  this.el = null;
};
