var file1 = require('./file1');

var File2 = {
  callMe: function circularA () {
    return file1.getCircular();
  },

  iReturn: function circularB () {
    return 'win';
  }
};

module.exports = File2;