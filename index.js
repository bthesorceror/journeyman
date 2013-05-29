var http         = require('http'),
    util         = require('util'),
    EventEmitter = require('events').EventEmitter;

function Journeyman(port, options) {
  EventEmitter.call(this);
  options = options || {};
  var self = this;
  self.middleware = options['middleware'] || []
  self.port = port;
  self.server = http.createServer(function(req, res) {
    self.handle.call(self, req, res);
  });
}

util.inherits(Journeyman, EventEmitter);

Journeyman.prototype.listen = function() {
  this.server.listen(this.port);
}

Journeyman.prototype.handle = function(req, res) {
  var index = 0;
  var self  = this;

  var start = new Date();

  this.emit('start', req, res);

  var end = res.end;

  function decorateEnd(func) {
    return function() {
      func.apply(this, arguments);
      var end = new Date();
      var time_diff = ((end.getTime() - start.getTime()) / 1000.0);
      self.emit('end', req, res, time_diff); 
    } 
  }

  res.end = decorateEnd(res.end);

  function next() {
    index = index + 1;
    self.middleware[index] && self.middleware[index](req, res, next);
  }

  self.middleware[index](req, res, next);
}

Journeyman.prototype.use = function(func) {
  this.middleware.unshift(func);
}

module.exports = Journeyman
