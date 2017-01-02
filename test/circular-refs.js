var assert = require('assert');
var file2 = require('./circular-refs/file2');

describe('wrap-static-functions', function () {
  it('should be able to resolve circular references', function () {
    var actual = file2.callMe();
    assert.equal(actual, 'win');
  });
});