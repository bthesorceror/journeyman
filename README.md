# Journeyman

[![Build Status](https://travis-ci.org/bthesorceror/journeyman.png?branch=master)](https://travis-ci.org/bthesorceror/journeyman)

[![NPM](https://nodei.co/npm-dl/journeyman.png)](https://nodei.co/npm/journeyman/)

[![NPM](https://nodei.co/npm/journeyman.png?downloads=true)](https://nodei.co/npm/journeyman/)

thin wrapper for middleware with node's http server

## Example

```javascript
var Journeyman = require('journeyman');

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
```

going to http://localhost:3000 will render out a success with the contents "WHERE AM I??"

## SSL support

Pass the path to both the ssl key and certificate

```javascript
var journeyman = new Journeyman(3001, { key: 'path/to/key', cert: 'path/to/certificate' });
```

## Now with time profiling

Journeyman will emit events at the start and end of every request-response cycle

### The `Start` Event

```javascript
server.on('start', function(req, res) {
  console.log('********************************');
  console.log('Response started');
  console.log('********************************');
});
```

### The `End` Event

```javascript
server.on('end', function(req, res, time) {
  console.log('********************************');
  console.log('Response completed in ' + time + ' seconds');
  console.log('********************************');
});
```

## Middleware error handling

The Middleware function has access to Journeyman itself through `this`.

In your middleware you should handle errors by calling 'this.handleError' with request, response and an error string.


## Middleware time profiling

Journeyman will also emit events at the beginning and end of each middleware

```javascript
server.use(function(req, res, next) {
  res.params = 'WHERE AM I??';
  next();
}, 'middleware name');
```

Middleware name will default to 'default' if it is not set.

### The `startMiddleware` Event

```javascript
server.on('startMiddleware', function(req, res, name) {
  console.log('********************************');
  console.log('Middleware: ' + name + ' has started');
  console.log('********************************');
});
```

### The `endMiddleware` Event

```javascript
server.on('endMiddleware', function(req, res, name, time) {
  console.log('********************************');
  console.log('Middleware: ' + name + ' completed in ' + time + ' seconds');
  console.log('********************************');
});
```

## Available middleware

- [rivulet](http://github.com/bthesorceror/rivulet) -- For easy server sent events
- [lightning_strike](http://github.com/bthesorceror/lightning_strike) -- For serving static content
- [rudder](http://github.com/bthesorceror/rudder) -- For http routing
