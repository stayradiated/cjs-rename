'use strict';

var unwire = require('unwire');
var assert = require('assert');
var fs     = require('./mock_fs');

describe('dependent', function () {

  var input, dependent;

  before(function () {
    dependent = unwire('../lib/dependent');
    dependent.__set__('fs', fs);
  });

  after(function () {
    dependent.__unwire__();
  });

  it('should edit dependencies', function (done) {
    
    var sourcePath = '/test/dependent.js';

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

  describe('.parse', function () {

    it('should do the thing', function () {

      var path = '/test/dependent/parse.js';

      var contents = [
        'var foo = require("./foo");',
        "var bar require('../bar');"
      ].join('\n');

      var expected = [
        'var foo = require("foo");',
        "var bar require('bar');"
      ].join('\n');

      var handler = function (fullPath, original) {
        switch (original) {
          case './foo':
            assert.equal(fullPath, '/test/dependent/foo');
            return 'foo';
          case '../bar':
            assert.equal(fullPath, '/test/bar');
            return 'bar';
          default:
            throw new Error('no case for: ' + original);
        }
      };

      var output = dependent.parse(path, contents, handler);
      assert.equal(output, expected);

    });

  });

});
