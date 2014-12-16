var bulk = require('bulk-require');
var widgets = bulk(__dirname + '/widgets', ['**/index.js']);
var request = require('hyperquest');
var apiBase = window.location.protocol + '//' + window.location.host + '/api';
var jsonstream = require('JSONStream');
var concat = require('concat-stream');
var cookie = require('cookie-monster');
var session = cookie.get('session-id');

var spinner = widgets.spinner();
var search = widgets.search();
var login = widgets.login();
var profile = widgets.profile();

var youtube = widgets.videolist();
var vimeo = widgets.videolist();
var detail = widgets.detail();
var status = widgets.status();

var body = document.body;

var viewport = document.querySelector('.viewport');

if (window.navigator.standalone) body.setAttribute('data-standalone', true);

if (session) {
  render();
} else {
  localStorage.clear();
  login.appendTo(viewport);
}

login.on('invalid', status.update.bind(status));
login.on('login', function() {
  cookie.set('session-id', 42);
  location.reload();
});

function render() {
  search.appendTo(viewport);
  profile.appendTo(viewport);
  var searchResults = localStorage.getItem('searchresults');
  if (searchResults) {
    renderSearch(JSON.parse(searchResults));
  }
}

status.appendTo(body);
spinner.appendTo(body);

search.on('search', function search(value) {
  spinner.start();
  var post = request.post(apiBase + '/search?q=' + encodeURIComponent(value));
  post.
    pipe(jsonstream.parse()).
    pipe(concat({encoding: 'object'}, renderSearch));
  post.end();
});

function renderSearch(results) {
  localStorage.setItem('searchresults', JSON.stringify(results));
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
