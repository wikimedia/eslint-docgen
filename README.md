# eslint-docgen
Generate ESLint documentation form tests

# Configuration

```jsonc
{
	"pluginName": "myplugin", // defaults to package name with 'eslint-plugin-' stripped
	"docPath": "docs/{name}.md", // required
	"rulePath": "src/rules/{name}.js", // optional, required if ruleLink is true
	"testPath": "tests/rules/{name}.js", // optional, required if testLink is true
	"docLink": false, // optional, adds a link to documentation source, default false
	"ruleLink": true, // optional, adds a link to rule source, default true
	"testLink": true, // optional, adds a link to test source, default true
}
```
