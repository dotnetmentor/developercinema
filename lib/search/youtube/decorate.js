var through = require('through2');
var jsonstream = require('JSONStream');
var duration = require('../../duration');
var config = require('../../../config');

module.exports = transform;

function transform() {
  return through.obj(decorate);
}

function decorate(data, enc, cb) {
  var media = data.media$group;
  cb(null, {
    title: (media.media$title || {}).$t,
    description: ((media.media$description || {}).$t || '').slice(0, 300),
    duration: duration((media.yt$duration || {}).seconds),
    embed: embed(media),
    author: authors(data),
    id: media.yt$videoid.$t,
    image: image(media)
  });
}

function image(data) {
  if (!data.media$thumbnail || !data.media$thumbnail.length) return;
  var sizes = data.media$thumbnail;
  sizes.sort(function(a, b) { return b.width - a.width; });
  return sizes[0].url;
}

function authors(data) {
  if (data.author && data.author.length) {
    return data.author.map(author).join(' ');
  }
}

function author(author) {
  if (!author || !author.name || !author.name.$t) return '';
  return author.name.$t;
}

function embed(data) {
  var size = config.embed.size;
  return '<iframe src="//www.youtube.com/embed/'+data.yt$videoid.$t+'?enablejsapi=1&autohide=2"'+
    ' width="' + size.width + '" height="' + size.height + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
  ;
}
