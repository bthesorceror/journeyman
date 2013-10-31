var assert = require('assert');

module.exports = function() {
  this.World = require("../support/world.js").World;

  this.When(/^I visit the root path$/, function(callback) {
    this.visit("/", callback);
  });

  this.When(/^I visit the (?:missing|error) page$/, function(callback) {
    this.visit("/", function(err, browser) {
      callback();
    });
  });

  this.Then(/^I receive a success status code$/, function(callback) {
    assert.ok(this.browser.success);
    callback();
  });

  this.Then(/^I see the text "([^"]*)" on the page$/, function(text, callback) {
    assert.equal(this.browser.text(), text);
    callback();
  });

  this.Then(/^I receive a not found status code$/, function(callback) {
    assert.equal(this.browser.statusCode, 404);
    callback();
  });

  this.Then(/^I receive a error status code$/, function(callback) {
    assert.equal(this.browser.statusCode, 500);
    callback();
  });

  this.Then(/^I see the correct error message$/, function(callback) {
    assert.equal(this.browser.text(), "Failed to load page");
    callback();
  });
}
