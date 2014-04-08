#!/usr/bin/env node
// vi:syntax=javascript

var program = require('commander');
var App = require('../lib/index');
var package = require('../package.json');
var Path = require('../lib/path');

var RED   = '\u001b[31m';
var BLUE  = '\u001b[34m';
var RESET = '\u001b[0m';

program
  .version(package.version)
  .option('-d, --dry', 'Do not write changes to disk.')
  .option('-s, --search', 'Search by filename')
  .command('*')
  .description('cjs-rename from to [source]')
  .action(command);

program.parse(process.argv);

// Show help if no args
if (! program.args.length) {
  console.log(program.help());
}

function command (from, to, source) {

  var cwd = process.cwd();

  from = typeof(from) === 'string' ? from : undefined;
  to = typeof(to) === 'string' ? to : undefined;

  if (! (from && to)) {
    return console.log(RED + 'Error:' + RESET, 'Must specify from and to');
  }

  var app = new App({
    mode: program.search ? 'search' : 'path',
    cwd: typeof(source) === 'string' ? source : cwd,
    from: from,
    to: to,
    dryrun: program.dry
  });

  app.run().then(function () {

    if (app.changes.length + app.files.length === 0) {
      return console.log('No changes made');
    }

    if (program.dry) {
      console.log(RED + 'Drymode:' + RESET, 'will not save changes');
    }

    var files = app.files.filter(function (file) {
      return file.move;
    });

    if (files.length) {
      console.log('\nMoving:');

      files.forEach(function (file) { 
        var from = Path.relative(cwd, file.from);
        var to   = Path.relative(cwd, file.to);
        console.log('-',  BLUE + from, RESET + '>' + BLUE, to, RESET);
      });
    }

    if (app.changes.length) {
      console.log('\nFixing:');

      app.changes.forEach(function (change) {
        var path = Path.relative(cwd, change.path);
        console.log('- [' + change.count + ']' + BLUE, path, RESET);
      });
    }

  });

}
