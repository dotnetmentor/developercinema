var through = require('through2');
var youtube = require('./youtube');
var vimeo = require('./vimeo');
module.exports = search;

function search(query) {
  var s = through();
  var results = {};
  vimeo(query, function(result) { results.vimeo = result; done(); });
  youtube(query, function(result) { results.youtube = result; done() });
  function done() {
    if (results.youtube && results.vimeo) {
      s.write(JSON.stringify(results));
      s.end();
    }
  }
  return s;
}
