var bulk = require('bulk-require');
var widgets = bulk(__dirname + '/widgets', ['**/index.js']);
var request = require('hyperquest');
var apiBase = window.location.protocol + '//' + window.location.host + '/api';
var jsonstream = require('JSONStream');
var concat = require('concat-stream');

var spinner = widgets.spinner();
var search = widgets.search();

var body = document.body;
var viewport = document.querySelector('.viewport');

if (window.navigator.standalone) body.setAttribute('data-standalone', true);

search.appendTo(viewport);
spinner.appendTo(body);

var youtube = widgets.videolist();
var vimeo = widgets.videolist();
var detail = widgets.detail();
var status = widgets.status();

status.appendTo(body);

search.on('search', function search(value) {
  spinner.start();
  var post = request.post(apiBase + '/search?q=' + encodeURIComponent(value));
  post.
    pipe(jsonstream.parse()).
    pipe(concat({encoding: 'object'}, searchResponse));
  post.end();
});

function searchResponse(results) {
  results = results[0];
  if (results) {
    youtube.remove();
    youtube.appendTo(viewport, results.youtube, 'Youtube');
    vimeo.remove();
    vimeo.appendTo(viewport, results.vimeo, 'Vimeo');
  }
  spinner.stop();
}

youtube.on('select', showVideo.bind(null, 'youtube'));

vimeo.on('select', showVideo.bind(null, 'vimeo'));

function showVideo(type, video) {
  video.type = type;
  detail.appendTo(viewport, video);
}

detail.on('back', detail.remove.bind(detail));
detail.on('*', function(context, name, msg) {
  if (context === 'player' && name === 'finished') {
    detail.reset();
    status.update(null, 'Please leave a review!');
  }
  console.log((context + ':' + name), msg);
});

detail.on('finished', detail.remove.bind(detail));
