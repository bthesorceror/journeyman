function Profiler() {
  this._started = new Date();
}

Profiler.profile = function(func) {
  var profiler = new Profiler();
  func();
  return profiler.stop();
}

Profiler.prototype.stop = function() {
  return ((new Date()).getTime() - this._started.getTime()) / 1000.0;
}

module.exports = Profiler;
