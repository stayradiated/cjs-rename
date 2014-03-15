'use strict';

var rewire = require('rewire');
var assert = require('assert');
var fs     = require('./mock_fs');

var dependent = rewire('../lib/dependent');

describe('dependent', function () {

  var input;

  before(function () {
    dependent.__set__('fs', fs);
  });

  it('should edit dependencies', function (done) {
    
    var sourcePath = '/test/dependent';

    var input = [
      'require("./foo");',
      'require("./bar");',
      'require("./qux");',
      'require("./test/bar");'
    ].join('\n');

    var output = [
      'require("./file/0");',
      'require("./file/1");',
      'require("./file/2");',
      'require("./file/3");',
    ].join('\n');

    fs.write(sourcePath, input);

    var i = 0;

    dependent(sourcePath, function (path) {
      return './file/' + i++;
    }).then(function (contents) {
      assert.equal(contents, output);
      done();
    }).done();
  });

});
