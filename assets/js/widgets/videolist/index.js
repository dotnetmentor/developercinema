var hyperglue = require('hyperglue');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var observable = require('observable');
var insertCss = require('insert-css');

module.exports = Videos;
inherits(Videos, EventEmitter);

function Videos() {
  if (!(this instanceof Videos)) return new Videos();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');

  this.listeners = {
    'selectVideo': this._selectVideo.bind(this)
  };

}

Videos.prototype._selectVideo = function selectVideo(e) {
  e.preventDefault();
  var li = e.target;
  while(li.nodeName !== 'LI') li = li.parentNode;
  var lis = li.parentNode.querySelectorAll('li');
  var index = [].indexOf.call(lis, li);
  this.emit('select', this.data[index]);
};

Videos.prototype.appendTo = function appendTo(el, data, title) {
  data = data || [];
  this.data = data;
  this.list = {
    'ul': {style: 'width: ' + (240 * data.length) + 'px'},
    'h3 span': title,
    'h3 i': {'class': 'icon-' + title.toLowerCase()},
    'li': data.map(map)
  };

  function map(item, i) {
    return {
      'a img': {
        src: item.image
      },
      '.duration': {
        _text: item.duration
      },
      '.title': {
        _text: item.title.slice(0, 34)
      }
    };
  }
  this.el = el.appendChild(hyperglue(this.html, this.list));
  this.ul = this.el.querySelector('ul');
  this._eventListeners('addEventListener');
};

Videos.prototype._eventListeners = function eventListeners(method) {
  var data = this.data;
  [].forEach.call(this.ul.querySelectorAll('li'), function list(li, i) {
    li[method]('click', this.listeners.selectVideo, false);
  }.bind(this));
};

Videos.prototype.remove = function remove() {
  if (!this.el) return;
  this._eventListeners('removeEventListener');
  this.el.parentNode.removeChild(this.el);
  this.el = null;
};
