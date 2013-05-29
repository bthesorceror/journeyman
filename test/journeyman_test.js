var Journeyman = require('../index.js'),
    mockery    = require('mockery'),
    sinon      = require('sinon'),
    assert     = require('assert'),
    stream     = require('stream');


function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

describe('Journeyman', function() {

  var response = new stream.Writable();

  describe('listen function', function() {
    var listenSpy = sinon.spy();
    var httpMock = {
      createServer: function(func) {
        return {
          listen: listenSpy
        }
      }
    }

    it('should call listen on http server', function() {
      mockery.enable({ useCleanCache: true });
      mockery.registerAllowables(['../index', 'events', 'util']);
      mockery.registerMock('http', httpMock);
      var jm = require('../index'),
          server = new jm(3000);
      server.listen();
      assert(listenSpy.calledWith(3000));
      mockery.deregisterAll;
      mockery.disable();
    });
  });

  describe('handle function', function() {

    it('should respond to being called', function() {
      var server = new Journeyman(3000);
      assert.ok(server.handle);
    });

    it('should call the first middleware', function(done) {
      var request  = "WORLD",
          server   = new Journeyman(3000);
      server.use(function(req, res) {
        assert.deepEqual(req, request);
        assert.deepEqual(res, response);
        done();
      });
      server.handle(request, response);
    });

    it('should pass along request and response', function(done) {
      var request  = "WORLD";
          server   = new Journeyman(3000);
      server.use(function(req, res) {
        assert.deepEqual(res.params, 'WHERE AM I??');
        done();
      });
      server.use(function(req, res, next) { next(); });
      server.use(function(req, res, next) {
        res.params = 'WHERE AM I??';
        next();
      });
      server.handle(request, response);
    });
  });

  describe('events', function() {
    var server = new Journeyman(3000),
        request  = 'request';

    server.use(function(req, res) {
      res.end();
    });

    it('should emit a "start" event with response and request', function(done){
      server.once('start', function(req, res){
        assert.equal(req, request);
        assert.equal(res, response);
        done();
      });
      server.handle(request, response);
    })

    it('should emit a "end" event with response, request and time', function(done){
      server.once('end', function(req, res, time){
        assert.equal(req, request);
        assert.equal(res, response);
        assert.ok(isNumber(time));
        done();
      });
      server.handle(request, response);
    })
  });

  describe('use function', function() {
    it('should add middleware', function() {
      var server = new Journeyman(3000);
      server.use('blah');
      assert.deepEqual(server.middleware, ['blah']);
    });

    it('should add middleware in the correct order', function() {
      var server = new Journeyman(3000);
      server.use('blah');
      server.use('rot');
      assert.deepEqual(server.middleware, ['rot', 'blah']);
    });
  });

});
