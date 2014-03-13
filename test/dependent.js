'use strict';

var assert = require('assert');
var dependent = require('../lib/dependent');

describe('dependent', function () {

  it('should edit dependencies', function () {

    var input = [
      'require("./foo");',
      'require("./bar");',
      'require("./qux");',
      'require("./test/bar");'
    ].join('\n');

    var i = 0;

    var output = dependent(input, function (path) {
      return './file/' + i++;
    });

    assert.equal(output, [
      'require("./file/0");',
      'require("./file/1");',
      'require("./file/2");',
      'require("./file/3");',
    ].join('\n'));

  });

});
