var through = require('through2');
var jsonstream = require('JSONStream');
var duration = require('../../duration');

module.exports = transform;

function transform() {
  return through.obj(decorate);
}

function decorate(data, _, cb) {
  cb(null, {
    title: data.name,
    description: (data.description || '').slice(0, 300),
    duration: duration(data.duration),
    embed: embed(data),
    author: '<a href="' + data.user.link + '">' + data.user.name + '</a>',
    image: image(data)
  });
}

function image(data) {
  if (!data.pictures || !(data.pictures.sizes || [].length)) return;
  var sizes = data.pictures.sizes;
  sizes.sort(function(a, b) { return b.width - a.width; });
  return sizes[0].link;
}

function embed(data) {
  return '<iframe src="//player.vimeo.com/video/'+
    data.uri.split('/').slice(-1)[0]+
    '?api=1&player_id=developercinema&share=0&badge=0"'+
    ' width="200" height="200" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
  ;
}
