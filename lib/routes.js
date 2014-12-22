var route = require('tiny-route');
var url = require('url');
var stack = require('stack');
var appcached    = require('appcached');
var fs = require('fs');
var mime = require('mime');
var browserify = require('./browserify');
var ecstatic = require('ecstatic');
var http = require('http');
var search = require('./search');
var config = require('../config');
var monot = require('monot');
var timestamp = monot();
var json = require('body/json')
var generateToken = require('./token');

var assetPath  = __dirname + '/../assets';

mime.default_type = 'text/html';
var store = require('./store')();
var users = store.users;

module.exports = stack(
  host,
  log,
  onlyAllowSameOrigin,
  securityHeaders,
  setContentType,
  loadSession,
  route(/^\/$/, html('index')),
  route('/appcache.manifest', appcache),
  route(/style.css/, css('style')),
  route(/bundle.js/, js('app')),
  route(/touch-/, logo),
  route(/app.js.map.json/, sourcemap('app')),
  route(/favicon.ico/, favicon),
  route(/_empty.js/, empty),
  route(/^\/verify/, verify),
  route(/^\/reset/, reset),
  ecstatic({cache: 0, root: './fontello/', baseDir: '/', showDir: false, handleError: false}),
  route(/\/api\/authenticated/, checkAuthenticated),
  route.post(/\/api\/login/, login),
  route.post(/\/api\/logout/, logout),
  route.post(/\/api\/reset/, sendReset),
  auth,
  route.post(/\/api\/search/, searchQuery),
  route.post(/\/api\/metrics/, metrics)
);

function host(q, r, next) {
  var protocol = q.headers['x-nginx-proxy'] ? 'https://' : 'http://';
  host.baseUrl = protocol + q.headers.host;
  host.url = host.baseUrl + q.url;
  next();
}

function logout(q, r, next) {
  q.session.destroy(redirectLogin.bind(null, r));
}

function checkAuthenticated(q, r, next) {
  authenticated(q, function(ok) {
    r.writeHead(200);
    r.end(ok ? 'true' : 'false');
  });
}

function authenticated(q, cb) {
  q.session.get('user', exists);
  function exists(err, user) {
    if (!user) return noauth();

    users.get(user.username, get);

    function get(err, account) {
      if (err) return noauth();
      if (Object.keys(user).filter(invalid).length) return noauth();
      cb(true);

      function invalid(key) {
        return !account[key] || account[key] !== user[key];
      }
    }

    function noauth() {
      cb(false);
    }
  }
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

function verify(q, r) {
  var token = url.parse(q.url, true).query.token;
  var key = 'tokens!' + token;
  db.store.get(key, function(err, email) {
    if (err) {
      r.writeHead(403);
      return r.end('Invalid link sorry');
    }
    db.store.del(key, dbOp.bind(null, 'deleting ' + key));
    users.put(email, {verified: true, username: email, timestamp: timestamp.now() }, redirectLogin.bind(null, r));
  });
}

function dbOp(op, err) {
  if (err) console.error('operation %s failed with %s', op, err);
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

function onlyAllowSameOrigin(q, r, next) {
  if (!q.headers.origin) return next();
  var host = q.headers.host;
  var origin = q.headers.origin.replace(/https?:\/\//, '');
  if (host !== origin) {
    console.log('rejecting url:%s, host:%s, origin:%s', q.url, host, origin);
    r.writeHead(403);
    r.end();
  } else {
    next();
  }
}

function securityHeaders(q, r, next) {
  r.setHeader('X-Frame-Options', 'deny');
  var csp = ''+
    "script-src 'self' https://api.twitter.com;"+
    "object-src none;"+
    "style-src 'self' http: 'unsafe-inline' https: 'unsafe-inline';"+
    "img-src *;"+
    "media-src http://www.youtube.com http://player.vimeo.com https://www.youtube.com https://player.vimeo.com;"+
    "frame-src http://www.youtube.com http://player.vimeo.com https://www.youtube.com https://player.vimeo.com;"
  ;
  r.setHeader('Content-Security-Policy', csp);
  r.setHeader('X-Content-Security-Policy', csp);
  r.setHeader('X-WebKit-CSP', 'nosniff');
  r.setHeader('X-XSS-Protection', '1; mode=block');
  next();
}

function setContentType(q, r, next) {
  var contentType = mime.lookup(host.url);
  var charset = mime.charsets.lookup(contentType);
  if (charset) contentType += '; charset=' + charset;
  r.setHeader('Content-Type', contentType);
  next();
}

function loadSession(q, r, next) {
  store.session(q, r, next);
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

function auth(q, r, next) {
  authenticated(q, function(ok) {
    if (ok) return next();
    return noauth();
  });
  function noauth() {
    r.writeHead(401);
    r.end();
  }
}

function searchQuery(q, r, next) {
  var term = url.parse(q.url, true).query.q;
  console.log('searching for %s', term);
  r.statusCode = 200;
  search(term).pipe(r);
}

function metrics(q, r, next) {
  json(q, r, send)
  function send(err, metrics) {
    q.session.get('user', userMetrics);
    function userMetrics(err, user) {
      db.store.put('metrics!' + user.username + '!' + timestamp.now(), metrics, function(err) {
        if (err) {
          r.writeHead(500);
          return r.end('metrics failed');
        }
        r.writeHead(200);
        r.end();
      });
    }
  }
}

function login(q, r, next) {
  r.statusCode = 200;
  json(q, r, send)
  function send(err, cred) {
    users.verify('basic', cred, function (err, ok, id) {
      if (ok) return users.get(cred.username, get);
      if (!id) return createUser();
      if (err || !ok) {
        return invalidLogin(r, 'Invalid credentials');
      }
      return users.get(cred.username, get);
    })

    function get(err, user) {
      if (user && !user.verified) {
        if (user.token) return generatedToken(null, user.token);
        return invalidLogin(r, 'Invalid credentials');
      }
      if (user && user.verified) {
        user.username = cred.username;
        q.session.set('user', user);
        return r.end();
      }
    }

    function createUser() {
      var opts = {
        login: {basic: cred},
        value: {verified: false}
      };
      users.create(cred.username, opts, created);
    }

    function created(err) {
      if (!err) {
        generateToken(generatedToken);
      } else {
        console.error('Failed to create user %s, error %s', cred.username, err);
        return invalidLogin(r, 'User creation failed');
      }
    }

    function generatedToken(err, value) {
      if (!err) {
        console.error('Should email token %s', host.baseUrl + '/verify?token=' + value);
        db.store.put('tokens!' + value, cred.username, function done() {
          users.put(cred.username, {verified: false, token: value}, invalidLogin.bind(null, r, 'email_sent'));
        });
      } else {
        console.error('Failed to create token for user %s', cred.username);
        return invalidLogin(r, 'User creation failed');
      }
    }
  }
}

function sendReset(q, r, next) {
  json(q, r, send)
  function send(err, cred) {
    users.get(cred.username, function (err, user) {
      if (!user) return invalidLogin(r, 'Invalid credentials');
      generateToken(generatedToken);
      function generatedToken(err, value) {
        if (!err) {
          console.error('Should email reset token %s', host.baseUrl + '/reset?token=' + value);
          db.store.put('reset!' + value, cred.username, invalidLogin.bind(null, r, 'email_sent'));
        } else {
          console.error('Failed to create token for user %s', cred.username);
          return invalidLogin(r, 'reset failed');
        }
      }
    });
  }
}

function reset(q, r, next) {
  var token = url.parse(q.url, true).query.token;
  var key = 'reset!' + token;
  db.store.get(key, function(err, email) {
    if (err) {
      r.writeHead(403);
      return r.end('Invalid link sorry');
    }
    db.store.del(key, dbOp.bind(null, 'deleting ' + key));
    users.remove(email, dbOp.bind(null, 'deleting user ' + email));
    redirectLogin(r);
  });
}

function invalidLogin(r, error) {
  r.writeHead(403);
  r.end(error);
}

function redirectLogin(r) {
  r.writeHead(302, {'Location': '/'});
  r.end();
}
