// features/support/world.js

var zombie = require('zombie');
var url    = "http://localhost:9999";

var World = function World(callback) {
  this.browser = new zombie();

  this.browser.silent = true;

  this.visit = function(path, callback) {
    this.browser.visit(url + path, function() {
      callback.apply(null, arguments);
    });
  };

  callback();
};

exports.World = World;
