var config = require.resolve('../config');
var through = require('through2');

module.exports = function (file) {
  if (file !== config) return through();

  return through(filter);

  function filter(data, enc, cb) {
    var json = JSON.parse(data);
    this.push(JSON.stringify({
      oauth: {
        github: {
          id: json.oauth.github.id
        },
        twitter: {
          id: json.oauth.twitter.id
        },
        facebook: {
          id: json.oauth.facebook.id
        },
      }
    }));
    cb();
  }
};
