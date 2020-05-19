# my-rule

## Rule details

❌ Examples of **incorrect** code:
```js
/* eslint my-plugin/my-rule: "error" */
var x = '1.23';
```

🔧 Examples of code **fixed** by using  `--fix`:
```js
/* eslint my-plugin/my-rule: "error" */
var x = '1.23'; /* → */ var x = '123';
```

## Resources

* [Rule source](/rules/my-rule.js)
* [Test source](/tests/my-rule.js)
