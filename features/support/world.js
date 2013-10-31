// features/support/world.js

var zombie = require('zombie');
var url    = "http://localhost:9999";

var World = function World(callback) {
  this.browser = new zombie();

  this.visit = function(path, callback) {
    this.browser.visit(url + path, callback);
  };

  callback();
};

exports.World = World;
