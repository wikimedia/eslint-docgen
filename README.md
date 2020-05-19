# eslint-docgen
Generate ESLint documentation form rule metadata and test cases.

## ⬇️ Installation

```sh
npm install eslint-docgen --save-dev
```

## 🛠️ Setup

Replace all uses of `RuleTester` with the version from this package:
```js
// Old:
const RuleTester = require( 'eslint' ).RuleTester;
// New:
const RuleTester = require( 'eslint-docgen' ).RuleTester;
```
Documentation will be built using rule metadata and test data passed to `RuleTester`:

#### `rule.meta.docs.description`
Used as the description of the rule in the documentation.

#### `rule.meta.docs.deprecated`
Will show a deprecation warning in the documentation.

#### `rule.meta.docs.replacedBy`
Will link to the replacement rule(s).

#### `tests.valid`/`tests.invalid` from `RuleTester#run`
Will generate code blocks showing examples of valid/invalid usage. Blocks will be grouped by unique `options`/`settings` configurations. Fixable rules with `output` will generate a separate block showing the before and after.
To exclude a test case from these comment blocks use the `noDoc` option:
```js
{
    code: 'App.invalid();',
    output: 'App.INVALID();',
    noDoc: true
}
```

## 📖 Usage
To build your documentation, run your test suite as normal with a `--doc` flag in the command line, e.g.
```sh
mocha tests/ --doc
```

## ⚙️ Configuration

Create a JSON/JavaScript file called `.eslintdocgenrc.json`/`.eslintdocgenrc.js` in your project root:

#### JSON
```jsonc
{
    "docPath": "docs/{name}.md",
    // ...
}
```

#### JavaScript
```js
module.exports = {
    docPath: 'docs/{name}.md',
    // ...
};
```

The following config options are available:

#### `docPath` (*required*)
The path to store rule documentation files, with `{name}` as a placeholder for the rule name, e.g. `"docs/{name}.md"` or `"rules/{name}/README.md"`.

#### `rulePath`
The path where the rule is defined, only required if `ruleLink` is `true`. Same format as `docPath`.

#### `testPath`
The path where the rule's tests are defined, only required if `testPath` is `true`. Same format as `docPath`.

#### `docLink` (default `false`)
Add a link to the documentation source in the "Resources" section.

#### `ruleLink` (default `true`)
Add a link to the rule source in the "Resources" section. Requires `rulePath` to be defined.

#### `testLink` (default `true`)
Add a link to the rule's test source in the "Resources" section. Requires `testPath` to be defined.

#### `templatePath`
When defined, templates in this path will override the defaults defined in [src/templates](src/templates).

#### `pluginName` (default from package name)
The name of your plugin as used in directives, e.g. `plugin:pluginName/rule`. Defaults to the name in `package.json` with `eslint-plugin-` stripped.

#### `fixCodeExamples` (default `true`)
Fix code examples using the ESLint configuration used for your `main` script.

#### `showConfigComments` (default `false`)
Shows config comments at the top of code examples:
```js
/* eslint myPlugin/rule: "error" */
// Test cases
```

#### `tabWidth` (default `4`)
Number of spaces to convert tabs to in code examples. Tabs in examples are always converted to spaces so their widths can be determined reliably for alignment.

## ✏️ Examples
* [Rule in eslint-plugin-no-jquery](https://github.com/wikimedia/eslint-plugin-no-jquery/blob/master/docs/no-error-shorthand.md)
* [Rule in eslint-plugin-mediawiki](https://github.com/wikimedia/eslint-plugin-mediawiki/blob/master/docs/valid-package-file-require.md)
* [Sample test case output](tests/cases/simple-rule.md)
