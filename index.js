var http = require('http');

function Journeyman(port, mw, initial) {
  var self = this;
  this.middleware = mw || []
  if (initial) { this.use(initial); }
  this.port = port;
  this.server = http.createServer(function(req, res) {
    self.handle.call(self, req, res);
  });
}

Journeyman.prototype.listen = function() {
  this.server.listen(this.port);
}

Journeyman.prototype.handle = function(req, res) {
  var index = 0;
  var self  = this;

  function next() {
    index = index + 1;
    self.middleware[index](req, res, next);
  }
  self.middleware[index](req, res, next);
}

Journeyman.prototype.use = function(func) {
  this.middleware.unshift(func);
}

module.exports = Journeyman
