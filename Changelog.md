# eslint-docgen release history

## v0.6.2
* Fix: Use throw instead of process.exit (#127) (Justin Poehnelt)
* Code: Update eslint-config-wikimedia to 0.21.0

## v0.6.1
* Fix: Filter out docgen:false tests before parsing (#120)

## v0.6.0
* Breaking change: Drop deprecated 'noDoc' option and '--doc' CLI flag (#115)
* New: build-docs-from-tests: add Vue syntax highlighting (#105) (DannyS712)
* New: Add TypeScript syntax highlighting
* New: Add HTML syntax highlighting
* New: Separate syntax highlighting support from showFilenames (#114)
* Fix: Don't put an empty line before the first multi-line examples in a set (#117)
* Code: Cleanup code for detecting highlight language (#113)

## v0.5.1
* Breaking change: Change the default icon for rules which are included in a preset (#109)
* Breaking change: Add generated-file-warning comment to the top of MD files (#107)
* Breaking change: Drop support for Node 10 (#110)
* New: Add configuration to show file names for test cases (#101) (DannyS712)
* New: Add per-rule config overrides (DannyS7123)
* Docs: Various README fixes
* Code: Update dependencies

## v0.4.5
* Code: Update dependencies

## v0.4.4

* Code: Ensure config.docPath exists before writing output path. (Raine Revere)
* Code: Calculate outputDir from outputPath
* Code: Fix reporting of writeFile error messages
* Code: Output formatted error when rule not found (#92)
* Docs: Fix config param heading level in README (#91)

## v0.4.3

* Code: Run one test 'it' per rule

## v0.4.2

* New: Introduce excludeExamplesByDefault config
* Code: Remove some whitespace in config-schema
* Code: Add a 'report' script

## v0.4.1

* Code: Update mocha to 8.0.1
* Code: Replace path with upath for windows compatibility (#83)
* Code: Use DOCGEN environment variable instead of --doc flag
* Code: Add an editorconfig to make the tabs a reasonable width on GitHub (Jed Fox)
* Code: Allow package.main to be empty
* Code: Support scoped plugin names
* Docs: Add more method documentation
* Docs: Fix external links to examples
* Docs: Add Migration section to README and move some pieces around

## v0.4.0

* Breaking change: New: Add fix message to introduction (#49)
* Breaking change: New: Format long lists correctly ("a, b, and c")
* Breaking change: New: Sort examples by options *then* valid/invalid (#48)
* New: Refactor rulesData to rulesWithConfig and expose (#16)
* New: Add ruleTemplatePath config (#14)
* New: Add showFixExamples config (#49)
* Code: Update eslint-config-wikimedia to 0.16.1 and use /mocha
* Code: Use pkg-dir
* Code: Create a JSON-schema to validate configs (#63)
* Code: Update various dependencies
* Tests: Separate config tests into get/validate
* Tests: Increase timeout
* Tests: Separate buildDocsFromTests cases
* Docs: Fix example docpath

## v0.3.1

* Fix: Use plugin's version of ESLint

## v0.3.0

* Breaking change: New: Support multi-line test cases (#34)
* New: Support multiple lines in formatter
* New: Add min/maxExamples to config (#29)
* New: Use chalk to do pretty output of warnings/errors (#38)
* Code: Bump node dependency to 10 (#44)
* Code: Use strict mode
* Code: Use eslint-plugin-node/recommended
* Code: Removed fixed length truncation from rules-data.js
* Tests: Add tests for most utils (#39)
* Tests: Increase code coverage to 100%
* Docs: Add "plugin" to description

## v0.2.0

* Breaking change: Refactor templates. Users with existing template overrides will need to rewrite them.
* Release: Update ejs to 3.1.3

## v0.1.0

* Initial release.
