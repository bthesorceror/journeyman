var util         = require('util'),
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
  this.generateEnd(req, res, profiler);
  this.func(req, res, this.generateNext(req, res, profiler));
}

module.exports = Middleware;
