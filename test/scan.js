'use strict';

var assert = require('assert');
var scan = require('../lib/scan');

describe('scan', function () {

  describe('.path', function () {

    it('should match paths', function () {

      var options = {
        from: 'foo',
        to: 'bar',
        input: [
          'foo.js',
          'foo.coffee'
        ]
      };

      var expected = [
        { from: 'foo.js', to: 'bar.js' }
      ];

      var output = scan.path(options);
      assert.deepEqual(output, expected);
    });

  });

  describe('.search', function () {
  });

});
