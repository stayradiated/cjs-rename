'use strict';

var assert = require('chai').assert;
var unwire = require('unwire');
var fs     = require('./mock_fs');

describe('rename', function () {

  var rename;

  before(function () {
    unwire.flush();
    var dependent = unwire('../lib/dependent');
    dependent.__set__('fs', fs);
    rename = require('../lib/rename');
  });

  after(function () {
    unwire.flush();
  });

  describe('parse', function (done) {

    it('should match paths without extensions', function (done) {

      var prefix = '/test/rename/parse/';

      var path = prefix + 'old.js';

      var files = [{
        from: prefix + 'old.js',
        to: prefix + 'new.js'
      }];

      fs.write(path, [
        'require("./old");',
        'require("./old.js");',
        'require("./old.coffee");',
        'require("./old.min.js");'
      ].join('\n'));

      rename.parse(path, files).then(function (output) {
        assert.deepEqual(output, expected);
        done();
      }).done();

      var expected = {
        path: path,
        count: 2,
        contents: [
          'require("./new");',
          'require("./new.js");',
          'require("./old.coffee");',
          'require("./old.min.js");'
        ].join('\n')
      };

    });

  });

  it('should scan for matching files', function (done) {

    var prefix = '/test/rename/';

    var options = [{
      from: prefix + 'old',
      to: prefix + 'new'
    }];

    var filelist = [
      prefix + 'old.js',
      prefix + 'foo.js',
      prefix + 'bar.js'
    ];

    fs.write(prefix + 'old.js', '');
    fs.write(prefix + 'foo.js', [
      'require("./old");'
    ].join('\n'));

    rename(options, filelist).then(function (changes) {
      assert.deepEqual(changes, expected);
      done();
    }).done();

    var expected = [{
      path: prefix + 'foo.js',
      count: 1,
      contents: 'require("./new");'
    }];

  });

});
