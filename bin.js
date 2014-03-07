var program = require('commander');
var Rename = require('./index');

program
  .version('0.0.1')
  .option('-f, --from [from]', 'Old name')
  .option('-t, --to [to]', 'New name')
  .option('-s, --source [source]', 'Source folder')

program.parse(process.argv);

var rename = new Rename({
  to: program.to,
  from: program.from,
  folder: program.source
});

rename.run(function () {
  console.log(rename.changes);
});

