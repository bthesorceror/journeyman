var http         = require('http'),
    util         = require('util'),
    Middleware   = require('./middleware'),
    Profiler     = require('./profiler'),
    EventEmitter = require('events').EventEmitter;


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
