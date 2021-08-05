# file-rule

File rule cares about the file name (variable names starting with "js" are reserved for JavaScript files, and "ts" are reserved for TypeScript files)

## Rule details

✔️ Examples of **correct** code:
```js
var x = 123;
var y = 456;
```

❌ Examples of **incorrect** code, for the file named `test.js`:
```js
var tsX = 123;
var tsY = 456;
```

✔️ Examples of **correct** code, for the file named `test.js`:
```js
var jsX = 123;
var jsY = 456;
```

❌ Examples of **incorrect** code, for the file named `test.ts`:
```js
var jsX = 123;
var jsY = 456;
```

✔️ Examples of **correct** code, for the file named `test.ts`:
```js
var tsX = 123;
var tsY = 456;
```

## Resources

* [Rule source](/rules/file-rule.js)
* [Test source](/tests/file-rule.js)
