var proxyObject = require('../../index');
var file2 = require('./file2');

var File1 = {
  getCircular: function getCircular () {
    return file2.iReturn(); // This would fail, because we required a file which required us
  }
};

// Circular references - resolve them
proxyObject(File1, true, function () {
  if (!Object.keys(file2).length) { // No fields means a possible circular reference
    file2 = require('./file2');
  }
});

module.exports = File1;