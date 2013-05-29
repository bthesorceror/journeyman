Journeyman
==========

[![Build Status](https://travis-ci.org/bthesorceror/journeyman.png?branch=master)](https://travis-ci.org/bthesorceror/journeyman)

thin wrapper for middleware with node's http server

Example
=======

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

Now with time profiling
=======================

Journey will emit events at the start and end of every request-response cycle

"start"

```javascript

server.on('start', function(req, res) {
  console.log('********************************');
  console.log('Response started');
  console.log('********************************');
});


```

"end"

```javascript

server.on('end', function(req, res, time) {
  console.log('********************************');
  console.log('Response completed in ' + time + ' seconds');
  console.log('********************************');
});

```
