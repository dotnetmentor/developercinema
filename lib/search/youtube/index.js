var request = require('hyperquest');
var jsonstream = require('JSONStream');
var config = require('../../../config');
var decorate = require('./decorate');
var through = require('through2');
var concat = require('concat-stream');

module.exports = search;

function search(query, cb) {
  var url = 'https://www.googleapis.com/youtube/v3/search?part=snippet&fields=items/id/videoId&type=video'+
    '&key=' + config.youtube.key + '&maxResults=8' + '&q=' + encodeURIComponent(query);
  return request(url).
    pipe(jsonstream.parse('items.*')).
    pipe(through.obj(detail)).
    pipe(decorate()).
    pipe(concat(cb));
  ;
}

function detail(item, enc, cb) {
  var url = 'https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id='+ item.id.videoId +
    '&key=' + config.youtube.key;
  return request(url).pipe(jsonstream.parse('items.*')).pipe(concat(cb.bind(null, null)));
}
