# simple-rule

My simple rule enforces a thing

⚠️ This rule is deprecated. Use [`my-new-simple-rule`](my-new-simple-rule.md), [`my-other-simple-rule`](my-other-simple-rule.md) instead.

⚙️ This rule is enabled in `plugin:eslint-docgen/recommended` with `[{"myOption":true}]` options.

⚙️ This rule is enabled in `plugin:eslint-docgen/strict`.

## Rule details

❌ Examples of **incorrect** code:
```js
/* eslint eslint-docgen/simple-rule: "error"*/
var x = '1.23';
var y = '4.5678';

multi
    .line
    .case;

multi.line.case;
singleAfterMulti;
```

❌ Examples of **incorrect** code with `[{"myOption":true}]` options:
```js
/* eslint eslint-docgen/simple-rule: ["error",[{"myOption":true}]]*/
var z1 = '1.23';
var z2 = '1.23';
```

✔️ Examples of **correct** code:
```js
/* eslint eslint-docgen/simple-rule: "error"*/
var x = '123';
var y = '45678';
```

✔️ Examples of **correct** code with `[{"myOption":true}]` options:
```js
/* eslint eslint-docgen/simple-rule: ["error",[{"myOption":true}]]*/
var z1 = '123';
var z2 = '123';
```

✔️ Examples of **correct** code with `[{"lang":"fr"}]` settings:
```js
/* eslint eslint-docgen/simple-rule: "error"*/
var x = '1,23';
```

✔️ Examples of **correct** code with `[{"myOption":true}]` options and `[{"lang":"fr"}]` settings:
```js
/* eslint eslint-docgen/simple-rule: ["error",[{"myOption":true}]]*/
var z1 = '1,23';
```

🔧 Examples of code **fixed** by using  `--fix`:
```js
/* eslint eslint-docgen/simple-rule: "error"*/
var x = '1.23';   /* → */ var x = '123';
var y = '4.5678'; /* → */ var y = '45678';

multi             /* → */ Multi
    .line         /* → */     .Line.Case;
    .case;        /* → */

multi.line.case;  /* → */ Multi
                  /* → */     .Line
                  /* → */     .Case;

singleAfterMulti; /* → */ SingleAfterMulti;
```

🔧 Examples of code **fixed** by using  `--fix` with `[{"myOption":true}]` options:
```js
/* eslint eslint-docgen/simple-rule: ["error",[{"myOption":true}]]*/
var z1 = '1.23';  /* → */ var z1 = '123';
var z2 = '1.23';  /* → */ var z2 = '123';
```

## Resources

* [Rule source](/rules/simple-rule.js)
* [Test source](/tests/simple-rule.js)
