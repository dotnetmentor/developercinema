var request = require('hyperquest');
var jsonstream = require('JSONStream');
var config = require('../../../config');
var decorate = require('./decorate');
var concat = require('concat-stream');

module.exports = search;

function search(query, cb) {
  var opt = { headers: { 'Authorization': config.vimeo.access_token } };
  var url = 'https://api.vimeo.com/videos?page=1&per_page=8&query='+
    encodeURIComponent(query)+
    '&sort=relevant&direction=desc'
  ;
  return request(url, opt).
    pipe(jsonstream.parse('data.*')).
    pipe(decorate()).
    pipe(concat(cb))
  ;
}
