var Journeyman = require('../index.js'),
    mockery    = require('mockery'),
    sinon      = require('sinon'),
    assert     = require('assert');


function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function noopResponse() {
}
noopResponse.prototype.end = function() {
}

describe('Journeyman', function() {

  var response = new noopResponse();

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
      mockery.registerAllowables(['../index', 'events', 'util', './profiler']);
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
    var server  = new Journeyman(3000),
        request = 'request',
        mwName  = "mwtest";

    server.use(function(req, res) {
      res.end();
    }, mwName);

    it('should emit a "startMiddleware" event with name', function(done){
      server.once('startMiddleware', function(req, res, name) {
        assert.equal(req, request);
        assert.equal(res, response);
        assert.equal(name, 'mwtest');
        done();
      });

      server.handle(request, response);
    });

    it('should emit a "endMiddleware" event with name', function(done){
      server.once('endMiddleware', function(req, res, name, time) {
        assert.equal(req, request);
        assert.equal(res, response);
        assert.equal(name, 'mwtest');
        assert.ok(isNumber(time));
        done();
      });

      server.handle(request, response);
    });

    it('should emit a "start" event with response and request', function(done) {
      server.once('start', function(req, res){
        assert.equal(req, request);
        assert.equal(res, response);
        done();
      });
      server.handle(request, response);
    });

    it('should emit a "end" event with response, request and time', function(done) {
      server.once('end', function(req, res, time){
        assert.equal(req, request);
        assert.equal(res, response);
        assert.ok(isNumber(time));
        done();
      });
      server.handle(request, response);
    });

    describe('multiple events', function() {
      var server  = new Journeyman(3000);

      server.use(function(req, res) { res.end(); });
      server.use(function(req, res, next) { next(); }, 'test');

      afterEach(function(){
        server.removeAllListeners();
      });

      it('should emit a "startmiddleware" event for multiple events', function(done){
        var count = 0;
        server.on('startMiddleware', function(req, res, name) {
          count += 1;
          if (count == 1) { assert.equal(name, 'test') }
          if (count == 2) { assert.equal(name, 'default'); done(); }
        });
        server.handle(request, response);
      });

      it('should emit a "endMiddleware" event for multiple events', function(done){
        var count = 0;
        server.on('endMiddleware', function(req, res, name, time) {
          count += 1;
          if (count == 1) { assert.equal(name, 'test') }
          if (count == 2) { assert.equal(name, 'default'); done(); }
          assert.ok(isNumber(time));
        });
        server.handle(request, response);
      });

    });
  });

  describe('use function', function() {
    it('should add middleware', function() {
      var server = new Journeyman(3000);
      server.use('blah');
      assert.deepEqual(server.middleware.func, 'blah');
    });

    it('should add middleware in the correct order', function() {
      var server = new Journeyman(3000);
      server.use('blah');
      server.use('rot');
      assert.deepEqual(server.middleware.func, 'rot');
    });
  });

});
