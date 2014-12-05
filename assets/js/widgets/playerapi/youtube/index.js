var inherits = require('inherits');
var EventEmitter = require('wildemitter');

module.exports = Player;
inherits(Player, EventEmitter);

function Player(el) {
  if (!(this instanceof Player)) return new Player(el);
  this.el = el;
  this.listeners = {
    message: this._message.bind(this)
  };
  this._eventListeners('addEventListener');
  EventEmitter.call(this);
}

Player.prototype.start = function start(el) {
  this.el = el;
  this.timer = setInterval(
    this._post.bind(this, {event: 'listening', id: 'developercinema'}),
    150
  );
};

Player.prototype._message = function message(e) {
  if (!this.el) return setTimeout(this._message.bind(this, e), 100);
  var data = JSON.parse(e.data);
  if (data.id === 'developercinema') {
    if (data.event === 'onReady') {
      this.emit('ready');
      clearInterval(this.timer);
    }
    this.emit('message', data);
    if (data.event === 'infoDelivery') {
      if (data.info.duration && data.info.currentTime === data.info.duration) {
        this.emit('finished');
      }
    }
  }
};

Player.prototype._eventListeners = function eventListeners(method) {
  window[method]('message', this.listeners.message, false);
};

Player.prototype.remove = function remove() {
  this._eventListeners('removeEventListener');
};

Player.prototype._post = function post(payload) {
  this.el.contentWindow.postMessage(JSON.stringify(payload), '*');
};
