'use strict';

var extension = require('../lib/extension');
var assert = require('assert');

describe('extension', function () {

  describe('exists', function () {

    it('should get the path extension', function () {
      var cases = [
        ['path.js', '.js']
      ];

      for (var i = 0, len = cases.length; i < len; i++) {
        var test = cases[i];
        assert.equal(extension.get(test[0]), test[1]);
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
        assert.equal(extension.match(test[0], test[1]), test[2]);
      }

    });

  });

});
