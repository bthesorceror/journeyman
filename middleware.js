var util         = require('util'),
    Profiler     = require('./profiler'),
    EventEmitter = require('events').EventEmitter;

function Middleware(func, name, next, server) {
  this.func   = func;
  this.next   = next;
  this.server = server;
  this.name   = (name || 'default');
}

util.inherits(Middleware, EventEmitter);

Middleware.prototype.generateNext = function(req, res, profiler) {
  return function(err) {
    this.emit('finished', req, res, this.name, profiler.stop());
    res.switchBackEnd();
    if (err)
      this.server.handleError(req, res, err);
    else
      this.next.run(req, res);
  }.bind(this)
}

Middleware.prototype.generateEnd = function(req, res, profiler) {
  var original_end = res.end;

  res.end = function() {
    this.emit('finished', req, res, this.name, profiler.stop());
    original_end.apply(res, arguments);
    res.switchBackEnd();
  }.bind(this)

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
