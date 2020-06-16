# eslint-docgen
Automatically generate ESLint plugin documentation from rule metadata and test cases.

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

Create a configuration file as described in [*Configuration*](#%EF%B8%8F-configuration), setting `docPath` and preferably `rulePath` and `testPath`.

## 📖 Usage
To build your documentation, run your rule tests with the `DOCGEN` environment variable set in the command line, e.g.
```sh
DOCGEN=1 mocha tests/rules/
```

Documentation will be built using **rule metadata** and **test data** passed to `RuleTester`:

#### `rule.meta.docs.description`
Used as the description of the rule in the documentation.

#### `rule.meta.docs.deprecated` / `rule.meta.docs.replacedBy`
Used to show a deprecation warning in the documentation, optionally with links to replacement rule(s).

#### `tests.valid`/`tests.invalid` from `RuleTester#run`
Will generate code blocks showing examples of valid/invalid usage. Blocks will be grouped by unique `options`/`settings` configurations. Fixable rules with `output` will generate a separate block showing the before and after.

By default all test cases will be included in the examples. To **exclude** specific test cases from these code blocks use the `docgen: false` option:
```js
{
    code: 'App.method();',
    docgen: false
}
```

If you have `excludeExamplesByDefault` set to `true` in your config, you can **include** specific test cases in these code blocks by using the `docgen: true` option:
```js
{
    code: 'App.method();',
    docgen: true
}
```


## 🤖 Migration
To migrate an existing plugin with manually built documentation you can use the following process:

1. Follow the steps in [*Installation*](#%EF%B8%8F-installation) and [*Setup*](#%EF%B8%8F-setup).
2. Move your existing documentation to a new folder, e.g. `docs/template/MYRULE.md` and in your `.eslintdocgenrc` set `ruleTemplatePath` to this new folder, e.g. `"docs/template/{name}.md`". Optionally you can rename these files to `.ejs`.
3. Run the generator (as described in [*Usage*](#-usage)) to confirm that it copies your old documentation (now your templates) back to the original documentation path.
4. Start switching out manually written sections of your templates with include blocks such as those found in [`index.ejs`](src/templates/index.ejs).

## ⚙️ Configuration

Create a JSON/JavaScript file called `.eslintdocgenrc.json`/`.eslintdocgenrc.js` in your project root:

#### JSON
```jsonc
{
    "docPath": "docs/rules/{name}.md",
    // ...
}
```

#### JavaScript
```js
module.exports = {
    docPath: 'docs/rules/{name}.md',
    // ...
};
```

The following config options are available:

#### `docPath` (*required*)
The path to store rule documentation files, with `{name}` as a placeholder for the rule name, e.g. `"docs/rules/{name}.md"` or `"rules/{name}/README.md"`.

#### `rulePath`
The path where the rule is defined, only required if `ruleLink` is `true`. Same format as `docPath`.

#### `testPath`
The path where the rule's tests are defined, only required if `testPath` is `true`. Same format as `docPath`.

#### `ruleTemplatePath`
When defined, will try to use a rule specific template instead of [`index.ejs`](src/templates/index.ejs), e.g. `"docs/templates/{name}.ejs"`. Same format as `docPath`.

#### `globalTemplatePath`
When defined, templates in this path will override the global templates defined in [`src/templates`](src/templates).

#### `docLink` (default `false`)
Add a link to the documentation source in the "Resources" section.

#### `ruleLink` (default `true`)
Add a link to the rule source in the "Resources" section. Requires `rulePath` to be defined.

#### `testLink` (default `true`)
Add a link to the rule's test source in the "Resources" section. Requires `testPath` to be defined.

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

#### `showFixExamples` (default `true`)
Show examples of how code is fixed by the rule.

### `excludeExamplesByDefault` (default `false`)
Exclude tests from being used as examples by default. When this is `true` users must set `docgen: true` on any test they want to be included in examples.

#### `minExamples` (default `['warn', 2]`)
Minimum examples per rule. Tuple where first value is one of `'warn'` or `'error'`, and the second value is the minimum number of examples required. Use `null` for no minimum.

#### `maxExamples` (default `['warn', 50]`)
Maximum examples per rule. Tuple where first value is one of `'warn'` or `'error'`, and the second value is the maximum number of examples allowed. Use `null` for no maximum.

#### `tabWidth` (default `4`)
Number of spaces to convert tabs to in code examples. Tabs in examples are always converted to spaces so their widths can be determined reliably for alignment.

## 🔍 Rules index

To assist with building an index of your rules, for example to put in a root README, this package exports `rulesWithConfig`. The value is a Map much like the one returned by [Linter#getRules](https://eslint.org/docs/developer-guide/nodejs-api#linter-getrules) but each rule has an additional `configMap` property that describes which configs include the rule and the options used (`null` if no options are used).

Note that the rule names do not include the plugin prefix.

Example:
```js
require( 'eslint-docgen' ).rulesWithConfig.get( 'no-event-shorthand' );
// Outputs:
{
    meta: [Object],
    create: [Function],
    configMap: Map {
        'deprecated-3.5' => null,
        'deprecated-3.3' => [ { allowAjaxEvents: true } ]
    }
}
```

## ✏️ Examples
* [Rule in eslint-plugin-no-jquery](https://github.com/wikimedia/eslint-plugin-no-jquery/blob/master/docs/rules/no-error-shorthand.md)
* [Rule in eslint-plugin-mediawiki](https://github.com/wikimedia/eslint-plugin-mediawiki/blob/master/docs/rules/valid-package-file-require.md)
* [Sample test case output](tests/cases/simple-rule.md)
