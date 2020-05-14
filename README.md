# eslint-docgen
Generate ESLint documentation form tests

# Configuration

Required:

```json
{
	"rulePath": "src/rules/{name}.js",
	"docPath": "docs/{name}.md"
}
```

Optional:

```json
{
	"pluginName": "myplugin" // defaults to package name with 'eslint-plugin-' stripped
}
```
