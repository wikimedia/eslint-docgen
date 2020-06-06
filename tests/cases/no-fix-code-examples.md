# my-rule

🔧 The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## Rule details

✔️ Examples of **correct** code:
```js
/*eslint my-plugin/my-rule: "error"*/
var x="123"
var y="45678"
```

❌ Examples of **incorrect** code with `[{"myOption":true}]` options:
```js
/*eslint my-plugin/my-rule: ["error",[{"myOption":true}]]*/
var x="1.23"
var y="4.5678"
```

🔧 Examples of code **fixed** by this rule with `[{"myOption":true}]` options:
```js
/*eslint my-plugin/my-rule: ["error",[{"myOption":true}]]*/
var x="1.23" /* → */ var x="123"
```

## Resources

* [Rule source](/rules/my-rule.js)
* [Test source](/tests/my-rule.js)
