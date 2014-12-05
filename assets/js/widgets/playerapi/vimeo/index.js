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
};

Player.prototype._message = function message(e) {
  if (!this.el) return setTimeout(this._message.bind(this, e), 100);
  var data = JSON.parse(e.data);
  if (data.player_id === 'developercinema') {
    if (data.event === 'ready') {
      this._post({method: 'addEventListener', value: 'playProgress'});
      this.emit('ready');
    }
    this.emit('message', data);
    if (data.event === 'playProgress') {
      if (data.data.percent === 1) {
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
