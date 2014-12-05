var through = require('through2');
var jsonstream = require('JSONStream');
var duration = require('../../duration');
var config = require('../../../config');

module.exports = transform;

function transform() {
  return through.obj(decorate);
}

function decorate(data, _, cb) {
  var id = data.uri.split('/').slice(-1)[0];
  cb(null, {
    title: data.name,
    description: (data.description || '').slice(0, 300),
    duration: duration(data.duration),
    embed: embed(id),
    author: '<a href="' + data.user.link + '">' + data.user.name + '</a>',
    id: id,
    image: image(data)
  });
}

function image(data) {
  if (!data.pictures || !(data.pictures.sizes || [].length)) return;
  var sizes = data.pictures.sizes;
  sizes.sort(function(a, b) { return b.width - a.width; });
  return sizes[0].link;
}

function embed(id) {
  var size = config.embed.size;
  return '<iframe src="//player.vimeo.com/video/'+
    id+
    '?api=1&player_id=developercinema&share=0&badge=0"'+
    ' width="' + size.width + '" height="' + size.height + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
  ;
}
