var domify = require('domify');
var inherits = require('inherits');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var insertCss = require('insert-css');

module.exports = Profile;
inherits(Profile, EventEmitter);

function Profile() {
  if (!(this instanceof Profile)) return new Profile();
  insertCss(fs.readFileSync(__dirname + '/style.css', 'utf-8'));
  this.html = fs.readFileSync(__dirname + '/index.html', 'utf-8');
}

Profile.prototype.appendTo = function appendTo(el, data) {
  this.el = el.appendChild(domify(this.html));
};

Profile.prototype.addProfile = function addProfile(profile) {
  this.profile = profile;
  this.el.querySelector('.profile').href = profile.html_url || profile.url || profile.link;
  this.el.querySelector('.picture').src = profile.thumbnail;
};

Profile.prototype.logout = function logout() {
  if (this.el) this.el.querySelector('.logout-form').submit();
};
