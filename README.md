# cjs-rename

Inspired by https://github.com/timruffles/misnomer/blob/master/README.md.

## CLI Usage

```
// current usage
cjs-rename -t ../source/old.js -f ../source/new.js -s ../source

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

- Only add the '.js' extension if it was there before
- Write tests
- Improve command line interface
- Move files

## Changelog

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
