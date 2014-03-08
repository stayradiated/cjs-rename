# cjs-rename

Inspired by https://github.com/timruffles/misnomer/blob/master/README.md.

Given a module a bad name? Used all over your codebase and tests? Sounds like you want to rename a CJS module, and this here module can do that for you:

```shell
> cjs-rename src/some-bad-name.js src/some-good-name.js
Renaming:
- src/foo/bad.js fixed 2 require()s
- src/foo/qux.js fixed 3 require()s
- test/foo/bar.js fixed 1 require()s
```

And magically, where you saw:

```javascript
require('../../src/some-bad-name');
```

You'll now find:

```javascript
require('../../src/some-good-name');
```


## Install

```shell
npm install -g cjs-rename
```

## CLI Usage

```shell
> cjs-rename

Usage: cjs-rename [options] [command]

Commands:

    *                      cjs-rename [from] [to] [source...]

Options:

    -h, --help     output usage information
    -V, --version  output the version number
    -d, --dry      Do not write changes to disk.
```

**Parameters:**

- `from`: path to the current file
- `to`: path to the file has been moved to
- `folder`: (optional). Which files to search through. Uses cwd by default.

**Example:**

```shell
> cjs-rename source/template.js source/view.js
Renaming:
- source/core.js fixed 1 require()s
- source/utils.js fixed 1 require()s
- test/template.js fixed 1 requires()s
```

## Module Usage

```javascript
var Rename = require('cjs-rename');

var rename = new Rename({
    to: '...',
    from: '...',
    folder: '...',
    cwd: '...', // optional
    dryrun: false // optional
});

rename.run(function (err, changes) {
    if (err) {
        console.log(err);
    } else {
        console.log(changes);
    }
});

// Also supports promises
rename.run().then(function (changes) { ... });

// If you set 'options.dryrun', then you need to save your changes
rename.save();
```

## Important Notes

- This will only search through files with the `.js` extension.
- It will ignore any `node_modules` folders.
- It will currently not move any files.

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
