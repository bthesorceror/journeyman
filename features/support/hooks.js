var Journeyman = require('../../index');

var port = 9999;

module.exports = function() {
  this.Around("@with_middleware", function(runScenario) {
    var server = this.server = new Journeyman(port);

    server.use(function(req, res) {
      res.writeHead(200);
      res.write(res.params);
      res.end();
    }, 'output');

    server.use(function(req, res, next) { next(); }, 'noop');

    server.use(function(req, res, next) {
      for (var i = 0; i < 1000000000; i++) {};
      res.params = 'WHERE AM I??';
      next();
    }, 'params setter');

    server.listen();

    runScenario(function(cb) {
      server.close();
      cb();
    });
  });

  this.Around("@without_middleware", function(runScenario) {
    var server = this.server = new Journeyman(port);

    server.listen();

    runScenario(function(cb) {
      server.close();
      cb();
    });
  });

  this.Around("@with_error_middleware", function(runScenario) {
    var server = this.server = new Journeyman(port);

    server.use(function(req, res) {
      this.handleError(req, res, 'Failed to load page');
    });

    server.listen();

    runScenario(function(cb) {
      server.close();
      cb();
    });
  });
}
