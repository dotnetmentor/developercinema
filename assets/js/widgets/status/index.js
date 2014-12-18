var domify       = require('domify');
var fs           = require('fs');
var insertCss    = require('insert-css');

module.exports = Status;

function Status() {
  if (!(this instanceof Status)) return new Status();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
}

Status.prototype.appendTo = function appendTo(el) {
  if (this.el) return this;
  this.el = el.appendChild(domify(this.html));
};

Status.prototype.update = function update(err, successText) {
  var el = this.el;
  reset();
  el.classList.add(err ? 'error' : 'success');
  el.innerHTML = !err ? successText : err;
  setTimeout(reset, 4500);

  function reset() {
    el.classList.remove('success');
    el.classList.remove('error');
  }
};
