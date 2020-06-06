# my-rule

🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## Rule details

❌ Examples of **incorrect** code:
```js
/* eslint my-plugin/my-rule: "error" */
var x = '1.23';
var x = '1.23';
```

❌ Examples of **incorrect** code with `[{"myOption":true}]` options:
```js
/* eslint my-plugin/my-rule: ["error",[{"myOption":true}]] */
var x = '1.23';
```

🔧 Examples of code **fixed** by this rule:
```js
/* eslint my-plugin/my-rule: "error" */
var x = '1.23'; /* → */ var x = '123';
var x = '1.23'; /* → */ var x = '123';
```

🔧 Examples of code **fixed** by this rule with `[{"myOption":true}]` options:
```js
/* eslint my-plugin/my-rule: ["error",[{"myOption":true}]] */
var x = '1.23'; /* → */ var x = '123';
```

## Resources

* [Rule source](/rules/my-rule.js)
* [Test source](/tests/my-rule.js)
