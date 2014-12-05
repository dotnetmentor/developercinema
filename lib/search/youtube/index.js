var request = require('hyperquest');
var jsonstream = require('JSONStream');
var config = require('../../../config');
var decorate = require('./decorate');
var concat = require('concat-stream');

module.exports = search;

function search(query, cb) {
  var url = 'https://gdata.youtube.com/feeds/api/videos?max-results=8&q='+
    encodeURIComponent(query)+
    '&v=2&alt=json'
  ;
  return request(url).
    pipe(jsonstream.parse('feed.entry.*')).
    pipe(decorate()).
    pipe(concat(cb));
  ;
}
