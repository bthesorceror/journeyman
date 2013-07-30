var http         = require('http'),
    util         = require('util'),
    Profiler     = require('./profiler'),
    Profiler     = require('./profiler'),
    EventEmitter = require('events').EventEmitter;

function Middleware(func, name, next) {
  this.func = func;
  this.next = next;
  this.name = (name || 'default');
}

util.inherits(Middleware, EventEmitter);

Middleware.prototype.generateNext = function(req, res, profiler) {
  var self = this;
  return function() {
    self.emit('finished', req, res, self.name, profiler.stop());
    res.switchBackEnd();
    self.next.run(req, res);
  }
}

Middleware.prototype.generateEnd = function(req, res, profiler) {
  var self = this;
  var original_end = res.end;

  res.end = function() {
    self.emit('finished', req, res, self.name, profiler.stop());
    original_end.apply(res, arguments);
  }

  res.switchBackEnd = function() {
    res.end = original_end;
  }
}

Middleware.prototype.run = function(req, res) {
  var profiler = new Profiler();
  this.emit('started', req, res, this.name);
  var end = res.end;
  this.generateEnd(req, res, profiler);
  this.func(req, res, this.generateNext(req, res, profiler));
}

function Journeyman(port, options) {
  EventEmitter.call(this);
  options = options || {};
  this.middleware = options['middleware'] || []
  this.middleware_names = options['middleware_names'] || []
  this.port = port;
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

Journeyman.prototype.use = function(func, name) {
  var middleware = new Middleware(func, name, this.middleware);
  this.middleware = middleware;

  var self = this;

  middleware.on('finished', function() {
    args = Array.prototype.slice.call(arguments, 0);
    self.emit.apply(self, ['endMiddleware'].concat(args));
  });

  middleware.on('started', function() {
    args = Array.prototype.slice.call(arguments, 0);
    self.emit.apply(self, ['startMiddleware'].concat(args));
  });
}

module.exports = Journeyman
