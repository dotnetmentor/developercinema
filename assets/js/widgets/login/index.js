var insertCss = require('insert-css');
var inherits = require('inherits');
var domify = require('domify');
var EventEmitter = require('events').EventEmitter;
var validator = require('validate-form');
var email = require('validate-form/email');
var min = require('validate-form/min');
var of = require('observable-form');
var fs = require('fs');

module.exports = Login;
inherits(Login, EventEmitter);

function Login() {
  if (!(this instanceof Login)) return new Login();
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.listeners = {
    reset: this._reset.bind(this),
    login: this._login.bind(this),
    noop: this._noop.bind(this)
  };
}

Login.prototype.appendTo = function appendTo(el) {
  this.el = el.appendChild(domify(this.html));
  this.form = of(this.el);
  this.fields = this.form.fields;
  setTimeout(open.bind(this), 100);
  function open() {
    this.el.classList.add('open');
  }
  this._eventListeners('addEventListener');
  this.el.querySelector('.email').focus();
};

Login.prototype._noop = function noop(e) {
  e.preventDefault();
};

Login.prototype._reset = function reset(e) {
  e.preventDefault();
  var errors = validator({
    email: email()
  })(this.form.toJSON());
  if (errors) {
    this.el.querySelector('.email').focus();
    return this.emit('invalid', showError(errors));
  }
  this.emit('reset', {username: this.fields.email()});
};

Login.prototype._login = function login(e) {
  e.preventDefault();
  var errors = validator({
    email: email(),
    password: min(6)
  })(this.form.toJSON());
  if (errors) {
    this.el.querySelector('.' + errors[0].attribute).focus();
    return this.emit('invalid', showError(errors));
  }
  this.emit('login', {username: this.fields.email(), password: this.fields.password()});
};

Login.prototype._eventListeners = function eventListeners(method) {
  this.el.querySelector('.credentials')[method]('submit', this.listeners.noop, false);
  this.el.querySelector('.login')[method]('click', this.listeners.login, false);
  this.el.querySelector('.reset')[method]('click', this.listeners.reset, false);
};

Login.prototype.remove = function remove() {
  if (!this.el) return;
  this._eventListeners('removeEventListener');
  this.el.parentNode.removeChild(this.el);
  this.el = null;
};

function showError(errors) {
  return errors.map(function(x) { return x.message; }).join('<br>');
}
