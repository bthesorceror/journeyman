var http         = require('http'),
    util         = require('util'),
    EventEmitter = require('events').EventEmitter;

function diff_in_secs(start, end) {
  return ((end.getTime() - start.getTime()) / 1000.0);
}

function Journeyman(port, options) {
  EventEmitter.call(this);
  options = options || {};
  var self = this;
  self.middleware = options['middleware'] || []
  self.middleware_names = options['middleware_names'] || []
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
  var mw_start;

  function decorateEnd(func) {
    return function() {
      func.apply(this, arguments);
      var end = new Date();
      self.emit('endMiddleware', req, res, 
                self.middlewareName(index), 
                diff_in_secs(mw_start, end));
      self.emit('end', req, res, diff_in_secs(start, end)); 
    } 
  }
  res.end = decorateEnd(res.end);

  function next() {
    self.emit('endMiddleware', req, res, 
              self.middlewareName(index), 
              diff_in_secs(mw_start, new Date()));
    index = index + 1;
    mw_start = new Date();
    self.runMiddleware(index, req, res, next);
  }
  mw_start = new Date();
  this.runMiddleware(index, req, res, next);
}

Journeyman.prototype.runMiddleware = function(index, req, res, next){
  this.emit('startMiddleware', req, res, this.middlewareName(index));
  this.middleware[index](req, res, next);
}

Journeyman.prototype.middlewareName = function(index) {
  return (this.middleware_names[index] || 'default');
}

Journeyman.prototype.use = function(func, name) {
  name = (name || 'default');
  this.middleware_names.unshift(name);
  this.middleware.unshift(func);
}

module.exports = Journeyman
