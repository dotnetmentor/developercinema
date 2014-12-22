var crypto = require('crypto');
var bs58 = require('bs58');

module.export = token;

function token(cb) {
  crypto.randomBytes(16, function generated(err, buffer) {
    cb(err, buffer ? bs58.encode(buffer) : null);
  });
}
