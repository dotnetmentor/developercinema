var bulk = require('bulk-require');
var widgets = bulk(__dirname + '/widgets', ['**/index.js']);
var request = require('hyperquest');
var apiBase = window.location.protocol + '//' + window.location.host + '/api';
var jsonstream = require('JSONStream');
var concat = require('concat-stream');

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

var get = request(apiBase + '/authenticated').pipe(concat(authenticated));

function authenticated(ok) {
  if (JSON.parse(ok)) {
    render();
  } else {
    localStorage.clear();
    login.appendTo(viewport);
  }
}

login.on('invalid', status.update.bind(status));
login.on('login', function(payload) {
  var post = request.post(apiBase + '/login');
  post.pipe(checkPostUser());
  post.write(JSON.stringify(payload));
  post.end();
});

login.on('reset', function(payload) {
  var post = request.post(apiBase + '/reset');
  post.pipe(checkPostUser());
  post.write(JSON.stringify(payload));
  post.end();
});

function checkPostUser() {
  return concat({encoding: 'object'}, function(err) {
    if (err.length) {
      if (err == 'email_sent') {
        status.update(null, 'Welcome! Please verify link in email');
      } else {
        status.update(err);
      }
    } else {
      spinner.start();
      location.href = '/';
    }
  });
}

function checkPost() {
  return concat({encoding: 'object'}, function(err) {
    if (err.length) {
      spinner.start();
      profile.logout();
    }
  });
}

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
  post.on('response', checkApiResponse);
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
  if (msg) {
    console.log('metrics', context, name, msg);
    //var post = request.post(apiBase + '/metrics');
    //post.pipe(checkPost());
    //post.write(JSON.stringify({context: context, name: name, msg: msg}));
    //post.end();
  }
});

detail.on('finished', detail.remove.bind(detail));

function checkApiResponse(response) {
  if (response.statusCode !== 200) {
    spinner.start();
    profile.logout();
  }
}

// tags
// +sessioncam
var scRec=document.createElement('SCRIPT');
scRec.type='text/javascript';
scRec.src="//d2oh4tlt9mrke9.cloudfront.net/Record/js/sessioncam.recorder.js";
document.getElementsByTagName('head')[0].appendChild(scRec);
// -sessioncam
