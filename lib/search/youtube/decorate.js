var through = require('through2');
var jsonstream = require('JSONStream');

module.exports = transform;

function transform() {
  return through.obj(decorate);
}

function decorate(data, enc, cb) {
  data = data[0];
  var media = data.snippet;
  cb(null, {
    title: media.title,
    description: (media.description || '').slice(0, 300),
    duration: (data.contentDetails.duration || '').match(/\d+/g).join(':'),
    embed: embed(data),
    author: '',
    id: data.id,
    image: image(media)
  });
}

function image(data) {
  if (!data.thumbnails) return;
  var sizes = Object.keys(data.thumbnails).map(function(x) { return data.thumbnails[x]; })
  sizes.sort(function(a, b) { return b.width - a.width; });
  return sizes[0].url;
}

function embed(data) {
  var size = {width: 305, height: 285};
  return '<iframe src="//www.youtube.com/embed/'+data.id+'?enablejsapi=1&autohide=2"'+
    ' width="' + size.width + '" height="' + size.height + '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
  ;
}
