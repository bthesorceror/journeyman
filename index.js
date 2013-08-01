var util         = require('util'),
    fs           = require('fs'),
    Middleware   = require('./middleware'),
    Profiler     = require('./profiler'),
    EventEmitter = require('events').EventEmitter;

function handle404(req, res) {
  res.writeHead(404);
  res.end('Page not found');
}

function Journeyman(port, options) {
  options = options || {};
  this.port = port;
  this._https = options['key'] && options['cert'];
  this.use(handle404);
  if (this._https) {
    this.setupHttpsOptions(options);
  }
}

util.inherits(Journeyman, EventEmitter);

Journeyman.prototype.setupHttpsOptions = function(options) {
  this._httpsOptions = {};
  this._httpsOptions['key'] = fs.readFileSync(options['key']);
  this._httpsOptions['cert'] = fs.readFileSync(options['cert']);
}

Journeyman.prototype.httpsOptions = function() {
  return this._httpsOptions;
}

Journeyman.prototype.createServer = function() {
  var server;
  if (this._https) {
    server = (require('https')).createServer(this._httpsOptions, this.handler());
  } else {
    server = (require('http')).createServer(this.handler());
  }
  return server;
}

Journeyman.prototype.server = function() {
  this._server = this._server || this.createServer();
  return this._server;
}

Journeyman.prototype.handler = function() {
  var self = this;
  return function(req, res) {
    self.handle.call(self, req, res);
  }
}

Journeyman.prototype.listen = function() {
  this.server().listen(this.port);
}

Journeyman.prototype.handle = function(req, res) {
  var index = 0;
  var self  = this;

  this.emit('start', req, res);

  this.emit('end', req, res, Profiler.profile(function() {
    self.middleware.run(req, res);
  }));
}

Journeyman.prototype.pipeEvent = function(event) {
  var self = this;
  return function() {
    args = Array.prototype.slice.call(arguments, 0);
    self.emit.apply(self, [event].concat(args));
  }
}

Journeyman.prototype.handleMiddlewareFinish = function() {
  return this.pipeEvent('endMiddleware');
}

Journeyman.prototype.handleMiddlewareStart = function() {
  return this.pipeEvent('startMiddleware');
}

Journeyman.prototype.use = function(func, name) {
  var middleware = new Middleware(func, name, this.middleware);

  middleware.on('finished', this.handleMiddlewareFinish());
  middleware.on('started', this.handleMiddlewareStart());

  this.middleware = middleware;
}

module.exports = Journeyman
