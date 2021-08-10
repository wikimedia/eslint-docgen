# file-rule

File rule cares about the file name (variable names starting with "js" are reserved for JavaScript files, "ts" are reserved for TypeScript files, "vue" are reserved for scripts in Vue files). Code fixes are disabled.

## Rule details

✔️ Examples of **correct** code:
```js
var x = 123;
var y = 456;
```

❌ Examples of **incorrect** code for a file named `test.js`:
```js
var tsX = 123;
var tsY = 456;
```

✔️ Examples of **correct** code for a file named `test.js`:
```js
var jsX = 123;
var jsY = 456;
```

❌ Examples of **incorrect** code for a file named `test.ts`:
```js
var jsX = 123;
var jsY = 456;
```

✔️ Examples of **correct** code for a file named `test.ts`:
```js
var tsX = 123;
var tsY = 456;
```

❌ Examples of **incorrect** code for a file named `test.vue`:
```vue

<template>
    <p>Placeholder...</p>
</template>
<script>
var jsZ = 789;
</script>

<template>
    <p>Placeholder...</p>
</template>
<script>
var tsZ = 789;
</script>
```

✔️ Examples of **correct** code for a file named `test.vue`:
```vue

<template>
    <p>Placeholder...</p>
</template>
<script>
var vueZ = 789;
</script>
```

## Resources

* [Rule source](/rules/file-rule.js)
* [Test source](/tests/file-rule.js)
