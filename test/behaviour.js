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

  before(function (done) {
    ncp(BACKUP, TESTDIR, function (err) {
      if (err) return console.error(err);
      done();
    }); 
  });

  it('should rename file dependencies', function (done) {

    var expectedChanges = [
      { type: 'fix', path: TESTDIR + '/custom.coffee', count: 3,
        contents: fs.readFileSync(EXPECTED + '/custom.coffee').toString() },
      { type: 'fix', path: TESTDIR + '/extension.js', count: 3,
        contents: fs.readFileSync(EXPECTED + '/extension.js').toString() },
      { type: 'fix', path: TESTDIR + '/quotes.js', count: 2,
        contents: fs.readFileSync(EXPECTED + '/quotes.js').toString() },
      { type: 'fix', path: TESTDIR + '/folder/parent.js', count: 1,
        contents: fs.readFileSync(EXPECTED + '/folder/parent.js').toString() },

      { type: 'move', from: TESTDIR + '/replace.js', to: TESTDIR + '/done.js' },
      { type: 'move', from: TESTDIR + '/replace.coffee', to: TESTDIR + '/done.coffee' }
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
    });
  });

});
