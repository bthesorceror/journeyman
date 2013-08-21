var util         = require('util'),
    fs           = require('fs'),
    Middleware   = require('./middleware'),
    Profiler     = require('./profiler'),
    EventEmitter = require('events').EventEmitter;

function handle404(req, res) {
  res.writeHead(404);
  res.end('Page not found');
}

function Journeyman(port, options) {
  options = options || {};
  this.port = port;
  this._https = options['key'] && options['cert'];
  this.use(handle404);
  if (this._https) {
    this.setupHttpsOptions(options);
  }
}

util.inherits(Journeyman, EventEmitter);

Journeyman.prototype.setupHttpsOptions = function(options) {
  this._httpsOptions = {};
  this._httpsOptions['key'] = fs.readFileSync(options['key']);
  this._httpsOptions['cert'] = fs.readFileSync(options['cert']);
}

Journeyman.prototype.httpsOptions = function() {
  return this._httpsOptions;
}

Journeyman.prototype.createServer = function() {
  var server;
  if (this._https) {
    server = (require('https')).createServer(this._httpsOptions, this.handler());
  } else {
    server = (require('http')).createServer(this.handler());
  }
  return server;
}

Journeyman.prototype.server = function() {
  this._server = this._server || this.createServer();
  return this._server;
}

Journeyman.prototype.handler = function() {
  return function(req, res) {
    this.handle.call(this, req, res);
  }.bind(this);
}

Journeyman.prototype.listen = function() {
  this.server().listen(this.port);
}

Journeyman.prototype.handle = function(req, res) {
  this.emit('start', req, res);

  this.emit('end', req, res, Profiler.profile(function() {
    this.middleware.run(req, res);
  }.bind(this)));
}

Journeyman.prototype.pipeEvent = function(event) {
  return function() {
    args = Array.prototype.slice.call(arguments, 0);
    this.emit.apply(this, [event].concat(args));
  }.bind(this)
}

Journeyman.prototype.handleMiddlewareFinish = function() {
  return this.pipeEvent('endMiddleware');
}

Journeyman.prototype.handleMiddlewareStart = function() {
  return this.pipeEvent('startMiddleware');
}

Journeyman.prototype.handleError = function(request, response, error) {
  response.writeHead(500);
  response.end(error);
}


Journeyman.prototype.use = function(func, name) {
  var middleware = new Middleware(func.bind(this), name, this.middleware);

  middleware.on('finished', this.handleMiddlewareFinish());
  middleware.on('started', this.handleMiddlewareStart());

  this.middleware = middleware;
}

module.exports = Journeyman
