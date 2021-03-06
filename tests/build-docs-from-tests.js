'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );
const path = require( 'upath' );
const testUtils = require( './test-utils' );

/* eslint-disable mocha/no-setup-in-describe */

describe( 'buildDocsFromTests', () => {
	const noDesc = { type: 'warn', text: 'No description found in rule metadata' };
	const cases = [
		{
			description: 'simple-rule.md: Basic features with default settings',
			name: 'my-rule',
			ruleMeta: {
				docs: {
					description: 'My rule enforces a thing',
					deprecated: true,
					replacedBy: [ 'my-new-rule', 'my-other-rule', 'third-rule' ]
				},
				fixable: 'code'
			},
			tests: {
				valid: [
					'var x = "123"',
					'var y = "45678"',
					'var z = { a: 3, ...b }',
					{
						code: 'var z1 = "123"',
						options: [ { myOption: true } ]
					},
					{
						code: 'var z2 = "123"',
						options: [ { myOption: true } ]
					},
					{
						code: 'var x = "1,23"',
						settings: [ { lang: 'fr' } ]
					},
					{
						code: 'var z1 = "1,23"',
						options: [ { myOption: true } ],
						settings: [ { lang: 'fr' } ]
					}
				],
				invalid: [
					{
						code: 'var x = "1.23"',
						output: 'var x = "123"'
					},
					{
						code: 'var y = "4.5678"',
						output: 'var y = "45678"'
					},
					{
						code: 'multi\n.line\n.case',
						output: 'Multi\n.Line.Case;'
					},
					{
						code: 'multi.line.case',
						output: 'Multi\n.Line\n.Case;'
					},
					{
						code: 'singleAfterMulti;',
						output: 'SingleAfterMulti;'
					},
					{
						code: 'var z1 = "1.23"',
						options: [ { myOption: true } ],
						output: 'var z1 = "123"'
					},
					{
						code: 'var z2 = "1.23"',
						options: [ { myOption: true } ],
						output: 'var z2 = "123"'
					}
				]
			},
			testerConfig: {
				parserOptions: { ecmaVersion: 2019 }
			},
			configMap: new Map( Object.entries( {
				recommended: [ { myOption: true } ],
				strict: null
			} ) ),
			expected: 'cases/simple-rule.md'
		},
		{
			description: 'no-fix-code-examples.md: No description, rule with `docgen: false`, fixCodeExamples:false, showConfigComments:true',
			ruleMeta: {
				fixable: 'code'
			},
			tests: {
				valid: [
					'var x="123"',
					'var y="45678"',
					{
						code: 'var z="not-included-in-docs"',
						docgen: false
					}
				],
				invalid: [
					{
						code: 'var x="1.23"',
						options: [ { myOption: true } ],
						output: 'var x="123"'
					},
					{
						code: 'var y="4.5678"',
						options: [ { myOption: true } ]
						// `output` missing, not allowed in ESLint >= 7
					}
				]
			},
			config: {
				showConfigComments: true,
				fixCodeExamples: false,
				minExamples: [ 'warn', 1 ],
				maxExamples: [ 'error', 3 ]
			},
			messages: [
				noDesc,
				{
					type: 'error',
					text: '5 examples found, expected fewer than 3.',
					label: 'config.maxExamples'
				}
			],
			expected: 'cases/no-fix-code-examples.md'
		},
		{
			description: 'no-fix-code-examples.md: No description, rules with `docgen: true`, excludeExamplesByDefault: true, fixCodeExamples:false, showConfigComments:true',
			ruleMeta: {
				fixable: 'code'
			},
			tests: {
				valid: [
					{
						code: 'var x="123"',
						docgen: true
					},
					{
						code: 'var y="45678"',
						docgen: true
					},
					'var z="not-included-in-docs"'
				],
				invalid: [
					{
						code: 'var x="1.23"',
						options: [ { myOption: true } ],
						output: 'var x="123"',
						docgen: true
					},
					{
						code: 'var y="4.5678"',
						options: [ { myOption: true } ],
						// `output` missing, not allowed in ESLint >= 7
						docgen: true
					}
				]
			},
			config: {
				excludeExamplesByDefault: true,
				showConfigComments: true,
				fixCodeExamples: false
			},
			messages: [
				noDesc
			],
			expected: 'cases/no-fix-code-examples.md'
		},
		{
			description: 'no-fix-code-examples.md: Deprecated `noDoc: true`.',
			ruleMeta: {
				fixable: 'code'
			},
			tests: {
				valid: [
					'var x="123"',
					'var y="45678"',
					{
						code: 'var z="not-included-in-docs"',
						noDoc: true
					}
				],
				invalid: [
					{
						code: 'var x="1.23"',
						options: [ { myOption: true } ],
						output: 'var x="123"'
					},
					{
						code: 'var y="4.5678"',
						options: [ { myOption: true } ]
						// `output` missing, not allowed in ESLint >= 7
					}
				]
			},
			config: {
				showConfigComments: true,
				fixCodeExamples: false
			},
			messages: [
				noDesc,
				{
					type: 'warn',
					text: '`noDoc: true` is deprecated. Use `docgen: false` instead.'
				}
			],
			expected: 'cases/no-fix-code-examples.md'
		},
		{
			description: 'config-comments.md: No valid cases, fixCodeExamples:true, showConfigComments:true',
			ruleMeta: {
				fixable: 'code'
			},
			tests: {
				valid: [],
				invalid: [
					{
						code: 'var x="1.23"',
						output: 'var x="123"'
					},
					// Duplicate example after lint-fix
					{
						code: 'var x = "1.23"',
						output: 'var x = "123"'
					},
					// Different options, not a duplicate
					{
						code: 'var x = "1.23"',
						options: [ { myOption: true } ],
						output: 'var x = "123"'
					}
				]
			},
			config: {
				showConfigComments: true,
				fixCodeExamples: true
			},
			messages: [
				noDesc,
				{
					type: 'warn',
					text: 'Duplicate code example found, examples can be hidden with `docgen: false`:\nvar x="1.23"\nvar x = "1.23"'
				}
			],
			expected: 'cases/config-comments.md'
		},
		{
			description: 'not-fixable.md: Rule not fixable, only docLink',
			tests: {
				valid: [],
				invalid: [
					{
						code: 'var x="1.23"',
						// Rule is not fixable, so output is ignored
						output: 'var x="123"'
					}
				]
			},
			config: {
				docLink: true,
				ruleLink: false,
				testLink: false
			},
			messages: [
				noDesc,
				{
					type: 'warn',
					text: '1 example found, expected at least 2.',
					label: 'config.minExamples'
				}
			],
			expected: 'cases/not-fixable.md'
		},
		{
			description: 'not-show-fixes.md: Don\'t show fixes',
			ruleMeta: {
				fixable: 'code'
			},
			tests: {
				valid: [
					'var x="4.56"'
				],
				invalid: [
					{
						code: 'var x="1.23"',
						output: 'var x="123"'
					}
				]
			},
			config: {
				showFixExamples: false,
				ruleTemplatePath: 'invalid/path/finds/no/templates/{name}.ejs'
			},
			messages: [ noDesc ],
			expected: 'cases/no-show-fixes.md'
		},
		{
			description: 'ruleTemplatePath',
			ruleMeta: {
				fixable: 'code'
			},
			tests: {
				valid: [
					'var x="4.56"'
				],
				invalid: [
					'var x="1.23"'
				]
			},
			config: {
				ruleTemplatePath: 'ruleTemplates/{name}.ejs'
			},
			messages: [ noDesc ],
			expected: 'cases/rule-template-path.md'
		},
		{
			description: 'scoped plugin',
			tests: {
				valid: [
					'var x="4.56"'
				],
				invalid: [
					'var x="1.23"'
				]
			},
			config: {
				showConfigComments: true
			},
			messages: [ noDesc ],
			cwd: 'cases/plugin-scoped',
			expected: 'cases/scoped-plugin.md'
		}
	];

	cases.forEach( ( caseItem ) => {
		it( caseItem.description, () => {
			testUtils.mockCwd( caseItem.cwd || 'cases/plugin/src' );

			const buildDocsFromTests = require( '../src/build-docs-from-tests' );
			const loadTemplates = require( '../src/load-templates' );
			const { globalTemplates, loadRuleTemplate } = loadTemplates( [ path.join( __dirname, '../src/templates' ) ] );
			const defaultConfig = require( '../src/default-config' );

			defaultConfig.docPath = 'docs/{name}.md';
			defaultConfig.rulePath = 'rules/{name}.js';
			defaultConfig.testPath = 'tests/{name}.js';

			function loadCase( filename ) {
				return fs.readFileSync( path.join( __dirname, filename ) ).toString();
			}

			const { output, messages } = buildDocsFromTests(
				caseItem.name || 'my-rule',
				caseItem.ruleMeta || {},
				caseItem.tests,
				caseItem.configMap,
				Object.assign( {}, defaultConfig, caseItem.config ),
				caseItem.templates || globalTemplates,
				loadRuleTemplate,
				caseItem.testerConfig
			);

			assert.strictEqual( output, loadCase( caseItem.expected ), 'output' );
			assert.deepEqual( messages, caseItem.messages || [], 'messages' );
		} );
	} );
} );
