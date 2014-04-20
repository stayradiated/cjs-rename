'use strict';

var Path = require('../lib/path');
var assert = require('chai').assert;

describe('path', function () {

  describe('relativeTo', function () {

    it('should create relative paths', function () {
      var from = '/Home/new.js';

      assert.equal(Path.relativeTo('/Home/folder', from), '../new.js');
      assert.equal(Path.relativeTo('/Home', from), './new.js');
    });

  });

  describe('extension', function () {

    describe('exists', function () {

      it('should get the path extension', function () {
        var cases = [
          ['path.js', '.js']
        ];

        for (var i = 0, len = cases.length; i < len; i++) {
          var test = cases[i];
          assert.equal(Path.extname(test[0]), test[1]);
        }

      });

    });

    describe('match', function () {

      it('should fix extension', function () {
        var cases = [
          ['path.js', 'original', 'path'],
          ['path', 'original.js', 'path.js'],
          ['path', 'original', 'path'],
          ['path.js', 'original.js', 'path.js']
        ];

        for (var i = 0, len = cases.length; i < len; i++) {
          var test = cases[i];
          assert.equal(Path.extension.match(test[0], test[1]), test[2]);
        }

      });

    });

  });

});
