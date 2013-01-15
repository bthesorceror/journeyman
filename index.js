var http = require('http');

function Journeyman(port, options) {
  options = options || {};
  var self = this;
  self.middleware = options['middleware'] || []
  self.port = port;
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
