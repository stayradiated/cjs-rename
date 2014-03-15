'use strict';

var assert = require('assert');
var rewire = require('rewire');
var fs     = require('./mock_fs');

var Rename = rewire('../lib/rename');
var dependent = rewire('../lib/dependent');

var SAMPLE = {
  cwd: '/Home',
  to: './new.js',
  from: './old.js',
  folder: '.'
};

describe('rename', function () {

  before(function () {
    dependent.__set__('fs', fs);
    Rename.__set__('dependent', dependent);
  });

  it('should use absolute paths', function () {

    var rename = new Rename({
      cwd: '/Home',
      to: './files/foo.js',
      from: './files/bar.js',
      folder: './files'
    });

    assert.equal(rename.cwd, '/Home');
    assert.equal(rename.to, '/Home/files/foo.js');
    assert.equal(rename.from, '/Home/files/bar.js');
    assert.equal(rename.folder, '/Home/files');
  });

  it('should work without "new" keyword', function () {
    var rename = Rename(SAMPLE);

    assert(rename instanceof Rename);
    assert.equal(rename.cwd, '/Home');
  });

  it('should create relative paths', function () {
    var rename = new Rename(SAMPLE);

    assert.equal(rename._relativeTo('/Home/folder'), '../new.js');
    assert.equal(rename._relativeTo('/Home'), './new.js');
  });

  describe('_replace', function (done) {

    it('should match paths without extensions', function (done) {
      var path = '/test/rename/replace';

      var rename = new Rename({
        cwd: '/test/rename',
        from: './old.js',
        to: './new.js'
      });

      var input = [
        'require("./old");',
        'require("./old.js");',
        'require("./old.coffee");',
        'require("./old.min.js");'
      ].join('\n');

      var output = [{
        path: path,
        count: 2,
        contents: [
          'require("./new");',
          'require("./new.js");',
          'require("./old.coffee");',
          'require("./old.min.js");'
        ].join('\n')
      }];

      fs.write(path, input);

      rename._replace(path, input).then(function () {
        assert.deepEqual(rename.changes, output);
        done();
      }).done();
    });

  });

});
