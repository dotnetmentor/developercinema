var insertCss = require('insert-css');
var inherits = require('inherits');
var hyperglue = require('hyperglue');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var titleCase = require('titlecase');

module.exports = Login;
inherits(Login, EventEmitter);

var PROVIDERS = ['github', 'twitter', 'facebook'];

function Login() {
  if (!(this instanceof Login)) return new Login();
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.listeners = {};
  var self = this;
  PROVIDERS.forEach(add);
  function add(provider) {
    self.listeners[provider] = function click() {
      self.el.classList.add('logging-in');
      self.emit('login', provider);
    };
  }
}

Login.prototype.appendTo = function appendTo(el) {
  this.list = {
    'li': PROVIDERS.map(map)
  };

  function map(provider) {
    return {
      'a': {
        'class': 'zocial ' + provider,
        '_text': titleCase(provider)
      }
    };
  }

  this.el = el.appendChild(hyperglue(this.html, this.list));

  setTimeout(open.bind(this), 100);

  function open() {
    this.el.classList.add('open');
  }

  this._eventListeners('addEventListener');
};

Login.prototype._eventListeners = function eventListeners(method) {
  PROVIDERS.forEach(add.bind(this));
  function add(provider) {
    this.el.querySelector('.' + provider)[method]('click', this.listeners[provider], false);
  }
};

Login.prototype.remove = function remove() {
  if (!this.el) return;
  this._eventListeners('removeEventListener');
  this.el.parentNode.removeChild(this.el);
  this.el = null;
};
