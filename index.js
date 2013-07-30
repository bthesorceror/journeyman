var http         = require('http'),
    util         = require('util'),
    Middleware   = require('./middleware'),
    Profiler     = require('./profiler'),
    EventEmitter = require('events').EventEmitter;

function handle404(req, res) {
  res.writeHead(404);
  res.end('Page not found');
}

function Journeyman(port) {
  EventEmitter.call(this);
  this.port = port;
  this.use(handle404);
  this.setupServer();
}

util.inherits(Journeyman, EventEmitter);

Journeyman.prototype.setupServer = function() {
  var self = this;
  self.server = http.createServer(function(req, res) {
    self.handle.call(self, req, res);
  });
}

Journeyman.prototype.listen = function() {
  this.server.listen(this.port);
}

Journeyman.prototype.handle = function(req, res) {
  var index = 0;
  var self  = this;

  var time = Profiler.profile(function() {
    self.emit('start', req, res);
    self.middleware.run(req, res);
  });

  self.emit('end', req, res, time);
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
