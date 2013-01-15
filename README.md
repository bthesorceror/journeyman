Journeyman
=======

[![Build Status](https://travis-ci.org/bthesorceror/journeyman.png?branch=master)](https://travis-ci.org/bthesorceror/journeyman)

thin wrapper for middleware with node's http server

Example
==============================

```ruby
var Journeyman = require('../index.js');

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
