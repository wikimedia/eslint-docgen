# my-rule

My rule enforces a thing

⚠️ This rule is deprecated. Use [`my-new-rule`](my-new-rule.md), [`my-other-rule`](my-other-rule.md) instead.

⚙️ This rule is enabled in `plugin:my-plugin/recommended` with `[{"myOption":true}]` options.

⚙️ This rule is enabled in `plugin:my-plugin/strict`.

## Rule details

❌ Examples of **incorrect** code:
```js
var x = '1.23';
var y = '4.5678';

multi
    .line
    .case;

multi.line.case;
singleAfterMulti;
```

✔️ Examples of **correct** code:
```js
var x = '123';
var y = '45678';
var z = { a: 3, ...b };
```

✔️ Examples of **correct** code with `[{"myOption":true}]` options and `[{"lang":"fr"}]` settings:
```js
var z1 = '1,23';
```

❌ Examples of **incorrect** code with `[{"myOption":true}]` options:
```js
var z1 = '1.23';
var z2 = '1.23';
```

✔️ Examples of **correct** code with `[{"myOption":true}]` options:
```js
var z1 = '123';
var z2 = '123';
```

✔️ Examples of **correct** code with `[{"lang":"fr"}]` settings:
```js
var x = '1,23';
```

🔧 Examples of code **fixed** by using  `--fix`:
```js
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
var z1 = '1.23';  /* → */ var z1 = '123';
var z2 = '1.23';  /* → */ var z2 = '123';
```

## Resources

* [Rule source](/rules/my-rule.js)
* [Test source](/tests/my-rule.js)
