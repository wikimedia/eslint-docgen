# eslint-docgen
Generate ESLint documentation form tests

# Configuration

Required:

```jsonc
{
	"rulePath": "src/rules/{name}.js",
	"docPath": "docs/{name}.md"
}
```

Optional:

```jsonc
{
	"pluginName": "myplugin" // defaults to package name with 'eslint-plugin-' stripped
}
```
