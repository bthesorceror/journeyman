var Journeyman = require('../../index');

module.exports = function() {
  this.Around(function(runScenario) {
    var port = 9999,
    server = new Journeyman(port);

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
}
