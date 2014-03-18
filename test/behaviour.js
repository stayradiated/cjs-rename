'use strict';

var assert = require('assert');
var Rename = require('../lib/rename');
var ncp = require('ncp');
var fs = require('fs');

var TESTDIR = __dirname + '/testdir';
var BACKUP = __dirname + '/testdir-backup';
var EXPECTED = __dirname + '/testdir-expected';

var sort = function (arr) {
  return arr.sort(function (a, b) {
    a = a.path || a.from;
    b = b.path || b.from;
    return a.localeCompare(b);
  });
};

describe('behaviour', function () {

  beforeEach(function (done) {
    ncp(BACKUP, TESTDIR, function (err) {
      if (err) return console.error(err);
      done();
    }); 
  });

  it('should rename file dependencies', function (done) {

    var expectedChanges = [
      { path: TESTDIR + '/custom.coffee', count: 3,
        contents: fs.readFileSync(EXPECTED + '/custom.coffee').toString() },
      { path: TESTDIR + '/extension.js', count: 3,
        contents: fs.readFileSync(EXPECTED + '/extension.js').toString() },
      { path: TESTDIR + '/quotes.js', count: 2,
        contents: fs.readFileSync(EXPECTED + '/quotes.js').toString() },
      { path: TESTDIR + '/folder/parent.js', count: 1,
        contents: fs.readFileSync(EXPECTED + '/folder/parent.js').toString() }

    ];

    var rename = new Rename({
      cwd: __dirname,
      to: './testdir/done',
      from: './testdir/replace',
      folder: './testdir/'
    });

    rename.run(function (err, changes) {
      assert.ifError(err);
      assert.deepEqual(sort(changes), sort(expectedChanges));
      done();
    }).done();
  });

});
