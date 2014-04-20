# cjs-rename

Inspired by https://github.com/timruffles/misnomer/blob/master/README.md.

Given a module a bad name that is used all over your codebase and tests? Sounds like you want to rename a CJS module, and this here module can do that for you:

```shell
> cjs-rename lib/some-bad-name.js lib/some-good-name.js

Moving:
- moved lib/some-bad-name.js to lib/some-good-name.js

Fixing:
- [1] lib/foo/bad.js
- [1] lib/foo/qux.js
- [1] test/foo/bar.js
```

And magically, where you saw:

```javascript
require('../../lib/some-bad-name');
```

You'll now find:

```javascript
require('../../lib/some-good-name');
```

**Search by filename**

Don't want to type out filepaths? Then add the `-s` flag to do a search.

Notice how it moves both files in the `lib` and `test` folders.

```shell
> cjs-rename -s some-bad-name some-good-name

Moving:
- moved lib/some-bad-name.js to lib/some-good-name.js
- moved test/some-bad-name.js to test/some-good-name.js

Fixing:
- [1] lib/foo/bad.js
- [1] lib/foo/qux.js
- [1] test/foo/bar.js
```


**Drymode**

Drymode will show you the affect the command will have, without actually saving
any changes. Just add the `-d` flag.

```shell
cjs-rename -s -d old new
Drymode: Will not save changes

Moving:
- moved lib/folder/old.js to lib/folder/new.js
-moved test/old.js to test/new.js

Fixing:
- [1] lib/folder/foo.js
- [1] test/foo.js
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

*                      cjs-rename from to [source]

Options:

-h, --help     output usage information
-V, --version  output the version number
-d, --dry      Do not write changes to disk.
-s, --search   Search by filename
```

**Parameters:**

- `from`: path to the current file
- `to`: path to the file has been moved to
- `source`: (optional). Which folder to search through. Uses the current folder
  by default.

**Example using current working directory**

```shell
> cjs-rename source/template.js source/view.js

Fixing:
- [1] source/core.js
- [1] source/utils.js
- [1] test/template.js
```

**Example using custom source directory**

```shell
> cjs-rename template.js view.js source

Fixing:
- [1] source/core.js
- [1] source/utils.js
- [1] test/template.js
```

## Module Usage

```javascript
var Rename = require('cjs-rename');

var rename = new Rename({
    from: './source/path',
    to: './where/to/move/to',

    // optional
    cwd: proces.cwd(),
    dryrun: false,
    mode: 'path',
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

### Rename constructor

Create a new Rename instance.

Can be called with or without `new`.

**Parameters:**

- `options` (object)
    - `from` (string) required
    - `to` (string) required
    - `cwd` (string)
    - `dryrun` (boolean)
    - `mode` (string)

**Example:**

```javascript
var rename = Rename({
    from: 'old',
    to: 'new',
    cwd: '/home/project/folder',
    mode: 'search'
});
```

### rename.run

Will move and rename files. Will automatically call `rename.save` unless you
specify `drymode: true` in the options.

**Parameters:**

- `[fn]` (function) : optional callback with signature `fn(err, changes)`

**Example:**

```javascript
rename.run(function (err, changes) {
    if (err) {
        console.log('Error', err);
    } else {
        console.log(changes);
    }
});
```

### rename.save

Save changes to disk.

**Paramters:**

- `[fn]` (function) : optional callback with signature `fn(err)`

**Example:**

```javascript
rename.save(function (err) {
    if (err) {
        console.log('Error', err);
    } else {
        console.log('Saved changes');
    }
});
```

## Important Notes

- This will only search through files with the `.js` and `.coffee` extensions.
- It will ignore any `node_modules` folders.

## Changelog

### 0.0.9

- Change regex prefix so that it can match `something(require('...'));`.

### 0.0.8

- Add support for moving files that do not exist (e.g. fixing a file that has
  already been moved).

### 0.0.7

- Use 'unwire' instead of 'rewire' for tests.

### 0.0.6

- Improve docs

### 0.0.5

- Color output of `cjs-rename` command
- Add `languages.js` so it should be pretty easy to add support for other
  languages
- Store the files that will be moved in `rename.files`
- Seperate API and rename code
- Use `xtnd.map` to map over an array and ignoring `undefined`

### 0.0.4

- Add support for coffeescript files
- Can now move files
- Add in scanning so that `options.from` can match multiple files
- Add `--search` flag for searching by filename

### 0.0.3

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
