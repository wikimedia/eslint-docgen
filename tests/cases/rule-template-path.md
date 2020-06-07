== My rule ==

Custom template for my rule.

## Rule details

❌ Examples of **incorrect** code:
```js
var x = '1.23';
```

✔️ Examples of **correct** code:
```js
var x = '4.56';
```

🔧 Examples of code **fixed** by this rule:
```js
var x = '1.23'; /* → */ var x = '123';
```

## When not to use use

You may not need this rule if you don't use ES6.

## Resources

* [Rule source](/rules/my-rule.js)
* [Test source](/tests/my-rule.js)
