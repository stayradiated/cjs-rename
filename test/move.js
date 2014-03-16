'use strict';

var assert = require('assert');
var rewire = require('rewire');
var fs     = require('./mock_fs');

var move = rewire('../lib/move');

describe('move', function () {

  before(function () {
    move.__set__('fs', fs);
  });

  it('should move a file from one place to another', function (done) {

    var moveFrom = '/test/move/a';
    var moveTo = '/test/move/b';

    fs.write(moveFrom, 'some text');

    move(moveFrom, moveTo).then(function () {
      return fs.read(moveTo);
    }).then(function (contents) {
      assert.equal(contents, 'some text');
      return fs.read(moveFrom);
    }).then(function (contents) {
      assert.equal(contents, undefined);
      done();
    }).done();

  });

  describe('.parse', function () {

    it('should fix required dependency', function () {

      var from = '/test/move/parse/a';
      var to   = '/test/move/b';

      var contents = [
        'require("./foo");',
        'require("../bar");',
        'require("../../qux");'
      ].join('\n');

      var expected = [
        'require("./parse/foo");',
        'require("./bar");',
        'require("../qux");'
      ].join('\n');

      var output = move.parse(from, to, contents);
      assert.equal(output, expected);

    });

  });

});

