var route = require('tiny-route');
var url = require('url');
var stack = require('stack');
var appcached    = require('appcached');
var fs = require('fs');
var mime = require('mime');
var browserify = require('./browserify');
var ecstatic = require('ecstatic');
var http = require('http');
var jsonstream = require('JSONStream');
var search = require('./search');
var config = require('../config');

var assetPath  = __dirname + '/../assets';

mime.default_type = 'text/html';

module.exports = stack(
  host,
  log,
  securityHeaders,
  setContentType,
  route(/^\/$/, html('index')),
  route('/appcache.manifest', appcache),
  route(/style.css/, css('style')),
  route(/bundle.js/, js('app')),
  route(/touch-/, logo),
  route.post(/\/api\/search/, searchQuery),
  route.post(/\/api\/logout/, logout),
  route(/app.js.map.json/, sourcemap('app')),
  route(/favicon.ico/, favicon),
  route(/_empty.js/, empty),
  ecstatic({cache: 0, root: './fontello/', baseDir: '/', showDir: false, handleError: false})
);

function host(q, r, next) {
  var protocol = q.headers['x-nginx-proxy'] ? 'https://' : 'http://';
  host.baseUrl = protocol + q.headers.host;
  host.url = host.baseUrl + q.url;
  next();
}

function logout(q, r, next) {
  var expires = 'Thu, 01 Jan 1970 00:00:00 GMT';
  r.writeHead(302, {'Location': '/', 'Set-Cookie': 'session-id=' + '42' + '; expires='+ expires + '; path=/;'});
  r.end();
}

function html(name) {
  return function bundle(q, r, next) {
    return fs.createReadStream(assetPath + '/html/' + name + '.html').
      pipe(r)
    ;
  };
}

function css(name) {
  return function bundle(q, r, next) {
    return fs.createReadStream(assetPath + '/css/' + name + '.css').
      pipe(r)
    ;
  };
}

function js(name) {
  return function bundle(q, r, next) {
    browserify(assetPath, name).
      pipe(r)
    ;
  };
}

function empty(q, r) {
  r.end();
}

function sourcemap(name) {
  return function serve(q, r, next) {
    return fs.createReadStream(__dirname + '/../' + name + '.js.map.json').
      pipe(r)
    ;
  };
}

function log(q, r, next) {
  console.log(new Date(), host.url);
  next();
}

function securityHeaders(q, r, next) {
  r.setHeader('X-Frame-Options', 'deny');
  r.setHeader('Content-Security-Policy',
    "script-src 'self' https://api.twitter.com;"+
    "object-src none;"+
    "style-src 'self' http: 'unsafe-inline' https: 'unsafe-inline';"+
    "img-src *;"+
    "media-src http://www.youtube.com http://player.vimeo.com https://www.youtube.com https://player.vimeo.com;"+
    "frame-src http://www.youtube.com http://player.vimeo.com https://www.youtube.com https://player.vimeo.com;"
  );
  next();
}

function setContentType(q, r, next) {
  var contentType = mime.lookup(host.url);
  var charset = mime.charsets.lookup(contentType);
  if (charset) contentType += '; charset=' + charset;
  r.setHeader('Content-Type', contentType);
  next();
}

function favicon(q, r, next) {
  fs.createReadStream(assetPath + '/img/logo-transparent.png').
    pipe(r)
  ;
}

function logo(q, r, next) {
  fs.createReadStream(assetPath + '/img/logo.png').
    pipe(r)
  ;
}

function appcache(q, r, next) {
  var localEndpoint = 'http://localhost:' + module.exports.port + '/';
  var manifest = appcache.manifest;
  if (manifest) {
    end(null, manifest);
  } else {
    appcached(localEndpoint, {network: ['*', host.baseUrl + '/*']}, end);
  }

  function end(err, manifest) {
    if (err) return console.error(q.url, err);
    var host = manifest.split(/\n/).slice(-1)[0].slice(0, -2) + '/';
    manifest = manifest.toString().replace(new RegExp(localEndpoint, 'gim'), host);
    appcache.manifest = manifest;
    r.write(manifest);
    r.end();
  }
}

function searchQuery(q, r, next) {
  var term = url.parse(q.url, true).query.q;
  console.log('searching for %s', term);
  search(term).pipe(r);
}
