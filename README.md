# cjs-rename

Inspired by https://github.com/timruffles/misnomer/blob/master/README.md.

## CLI Usage

```
// current usage
cjs-rename -t ../source/old.js -f ../source/new.js -s ../source

// timruffles idea
cjs-rename ../source/old.js new.js ../source

// my idea - if no source is specified, use parent dir
cjs-rename ../source/old.js new.js
```

## Module Usage

```javascript
var Rename = require('cjs-rename');

var rename = new Rename({
    cwd: '...', // optional
    to: '...',
    from: '...',
    folder: '...'
});

rename.run(function (err, changes) {
    if (err) {
        console.log(err);
    } else {
        console.log(changes);
    }
});
```

## Todo

- Only add the '.js' extension if it was there before
- Write tests
- Improve command line interface
- Add MIT license
- Move files

## Changelog

### 0.0.1

- Initial commit

## License

MIT
