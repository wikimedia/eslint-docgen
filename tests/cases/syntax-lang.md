[//]: # (This file is generated by eslint-docgen. Do not edit it directly.)

# syntax-lang

Syntax language set from filename extension, fixCodeExamples:false

## Rule details

❌ Examples of **incorrect** code:
```html
<script>
var jsX = 123;
</script>
```

✔️ Examples of **correct** code:
```html
<script>
var htmlX = 123;
</script>
```

❌ Examples of **incorrect** code:
```js
var tsX = 123;
var tsY = 456;
```

✔️ Examples of **correct** code:
```js
var x = 123;
var y = 456;
var jsX = 123;
var jsY = 456;
```

❌ Examples of **incorrect** code:
```ts
function jsF<T>(x: T): T { return x; }
```

✔️ Examples of **correct** code:
```ts
function tsF<T>(x: T): T { return x; }
```

❌ Examples of **incorrect** code:
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

✔️ Examples of **correct** code:
```vue
<template>
    <p>Placeholder...</p>
</template>
<script>
var vueZ = 789;
</script>
```

## Resources

* [Rule source](/rules/syntax-lang.js)
* [Test source](/tests/syntax-lang.js)
