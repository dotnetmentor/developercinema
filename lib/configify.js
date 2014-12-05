var config = require.resolve('../config');
var through = require('through2');
var includeKeys = [];

module.exports = function (file) {
  if (file !== config) return through();

  return through(filter);

  function filter(data, enc, cb) {
    var json = JSON.parse(data);
    this.push(JSON.stringify(includeKeys.reduce(reduce, {})));
    function reduce(result, key) {
      result[key] = json[key];
      return result;
    }
  }
};
