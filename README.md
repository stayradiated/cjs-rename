# cjs-rename

Inspired by https://github.com/timruffles/misnomer/blob/master/README.md.

## Install

```
npm install -g cjs-rename
```

## CLI Usage

```
// current usage - [from] [to] [source]
cjs-rename source/old.js source/new.js source

// timruffles idea - only specify file names, not paths
cjs-rename old.js new.js ../source

// my idea - if no source is specified, use current dir
cjs-rename old.js new.js
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

- Improve command line interface
- Move files

## Changelog

## 0.0.3

- Improve command line interface.
- If the original 'require()' call didn't have the extension, than the replaced
  path will not have the extension.
- Make 'options.folder' optional. It now uses the current working directory.
- Add 'options.dryrun'. If set to a truthy value, it will not save changes to
  disk.
- Add 'Rename.prototype.save'. This will write pending changes to disk.

### 0.0.2

- Add github page to package.json

### 0.0.1

- Initial commit

## License

The MIT License (MIT)

Copyright (c) 2014 George Czabania

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
