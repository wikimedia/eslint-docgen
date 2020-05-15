# eslint-docgen
Generate ESLint documentation form tests

# Configuration

```jsonc
{
	"pluginName": "myplugin", // optional, defaults to package name with 'eslint-plugin-' stripped
	"showConfigComments": false, // optional, defaults to false
	"docPath": "docs/{name}.md", // required
	"rulePath": "src/rules/{name}.js", // optional, required if ruleLink is true
	"testPath": "tests/rules/{name}.js", // optional, required if testLink is true
	"docLink": false, // optional, adds a link to documentation source, default false
	"ruleLink": true, // optional, adds a link to rule source, default true
	"testLink": true, // optional, adds a link to test source, default true
	"templatePath": "docs/templates", // optional, path containing .ejs template overrides
}
```
