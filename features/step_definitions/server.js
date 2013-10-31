var assert = require('assert');

module.exports = function() {
  this.World = require("../support/world.js").World;

  this.When(/^I visit the root path$/, function(callback) {
    this.visit("/", callback);
  });

  this.Then(/^I receive a success status code$/, function(callback) {
    assert.ok(this.browser.success);
    callback();
  });

  this.Then(/^I see the text "([^"]*)" on the page$/, function(text, callback) {
    assert.equal(this.browser.text(), text);
    callback();
  });
}
