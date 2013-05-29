var Journeyman = require('../index.js'),
    Zombie     = require('zombie'),
    assert     = require('assert');

describe('Journeyman', function() {
  var port = 3000,
      server = new Journeyman(port);

  server.use(function(req, res) {
    res.writeHead(200);
    res.write(res.params);
    res.end();
  });

  server.use(function(req, res, next) { next(); });

  server.use(function(req, res, next) {
    res.params = 'WHERE AM I??';
    next();
  });

  server.listen();

  // server.on('start', function(req, res) {
  //   console.log('********************************');
  //   console.log('Response started');
  //   console.log('********************************');
  // });

  // server.on('end', function(req, res, time) {
  //   console.log('********************************');
  //   console.log('Response completed in ' + time + ' seconds');
  //   console.log('********************************');
  // });

  it('works all together', function(done) {
    var zombie = new Zombie();
    zombie.visit("http://localhost:" + port, function() {
      assert.ok(zombie.success);
      assert.equal(zombie.text(), "WHERE AM I??");
      done();
    });
  });
});
