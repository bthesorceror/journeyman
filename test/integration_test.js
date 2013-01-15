var Journeyman = require('../index.js'),
    Zombie     = require('zombie'),
    assert     = require('assert');

describe('Journeyman', function() {
  var port = 3000,
      server = new Journeyman(port);

  server.use(function(req, res) {
    res.writeHead(200);
    res.end(res.params);
  });

  server.use(function(req, res, next) { next(); });

  server.use(function(req, res, next) {
    res.params = 'WHERE AM I??';
    next();
  });

  server.listen();

  it('works all together', function(done) {
    var zombie = new Zombie();
    zombie.visit("http://localhost:" + port, function() {
      assert.ok(zombie.success);
      assert.equal(zombie.text(), "WHERE AM I??");
      done();
    });
  });
});
