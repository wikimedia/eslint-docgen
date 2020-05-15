# simple-rule

My simple rule enforces a thing

⚠️ This rule is deprecated. Use [`my-new-simple-rule`](my-new-simple-rule.md), [`my-other-simple-rule`](my-other-simple-rule.md) instead.

This rule is enabled in `plugin:eslint-docgen/recommended` with `[{"myOption":true}]` options.

This rule is enabled in `plugin:eslint-docgen/strict`.

## Rule details

❌ The following patterns are considered errors:
```js
/* eslint eslint-docgen/simple-rule: "error"*/
var x = '1.23';
var y = '4.5678';
```

❌ With `[{"myOption":true}]` options:
```js
/* eslint eslint-docgen/simple-rule: ["error",[{"myOption":true}]]*/
var z1 = '1.23';
var z2 = '1.23';
```

✔️ The following patterns are not considered errors:
```js
/* eslint eslint-docgen/simple-rule: "error"*/
var x = '123';
var y = '45678';
```

✔️ With `[{"myOption":true}]` options:
```js
/* eslint eslint-docgen/simple-rule: ["error",[{"myOption":true}]]*/
var z1 = '123';
var z2 = '123';
```

✔️ With `[{"lang":"fr"}]` settings:
```js
/* eslint eslint-docgen/simple-rule: "error"*/
var x = '1,23';
```

✔️ With `[{"myOption":true}]` options and `[{"lang":"fr"}]` settings:
```js
/* eslint eslint-docgen/simple-rule: ["error",[{"myOption":true}]]*/
var z1 = '1,23';
```

🔧 The `--fix` option can be used to fix problems reported by this rule:
```js
/* eslint eslint-docgen/simple-rule: "error"*/
var x = '1.23';   /* → */ var x = '123';
var y = '4.5678'; /* → */ var y = '45678';
```

🔧 With `[{"myOption":true}]` options:
```js
/* eslint eslint-docgen/simple-rule: ["error",[{"myOption":true}]]*/
var z1 = '1.23';  /* → */ var z1 = '123';
var z2 = '1.23';  /* → */ var z2 = '123';
```

## Resources

* [Rule source](/rules/simple-rule.js)
* [Test source](/tests/simple-rule.js)
