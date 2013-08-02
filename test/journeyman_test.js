var Journeyman = require('../index.js'),
    sinon      = require('sinon'),
    path       = require('path'),
    fs         = require('fs'),
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

  describe("Initialization", function() {

    it('setups correct https options', function() {
      var key_path = path.join(__dirname, 'key.txt'),
          cert_path = path.join(__dirname, 'cert.txt');

      var server = new Journeyman(3001, { key: key_path, cert: cert_path });

      var options = {
        key: fs.readFileSync(key_path),
        cert: fs.readFileSync(cert_path)
      }

      assert.equal(server.httpsOptions().key.toString(), options.key.toString());
      assert.equal(server.httpsOptions().cert.toString(), options.cert.toString());
    });

  });

  describe('Server type', function() {

    it('sets server type to http', function() {
      var server = new Journeyman(3001);
      assert.deepEqual(server.createServer().prototype, require('http').prototype)
    });

    it('sets server type to https', function() {
      var key_path = path.join(__dirname, 'key.pem'),
          cert_path = path.join(__dirname, 'cert.pem');

      var server = new Journeyman(3001, { key: key_path, cert: cert_path });

      assert.deepEqual(server.createServer().prototype, require('https').prototype)
    });

  });

  describe('listen function', function() {

    it('calls listen on server with port', function() {
      var server = new Journeyman(3001, { https: true });
      var spy = sinon.spy();

      server.server = function() { return { listen: spy }; };
      server.listen();
      assert(spy.calledWith(3001));
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
