const buildDocsFromTests = require( '../src/build-docs-from-tests' );
const assert = require( 'assert' );
const fs = require( 'fs' );
const path = require( 'path' );
const simple = require( 'simple-mock' );

describe( 'buildDocsFromTests', () => {
	simple.mock( process, 'cwd' ).returnWith( path.join( __dirname, 'cases/plugin/src' ) );
	const loadTemplates = require( '../src/load-templates' );
	const defaultTemplates = loadTemplates( [ path.join( __dirname, '../src/templates' ) ] );
	const defaultConfig = require( '../src/default-config' );

	defaultConfig.docPath = 'docs/{name}.md';
	defaultConfig.rulePath = 'rules/{name}.js';
	defaultConfig.testPath = 'tests/{name}.js';

	function loadCase( filename ) {
		return fs.readFileSync( path.join( __dirname, filename ) ).toString();
	}

	const cases = [
		{
			name: 'my-rule',
			ruleMeta: {
				docs: {
					description: 'My rule enforces a thing',
					deprecated: true,
					replacedBy: [ 'my-new-rule', 'my-other-rule' ]
				},
				fixable: 'code'
			},
			tests: {
				valid: [
					'var x = "123"',
					'var y = "45678"',
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
			ruleData: [
				{
					config: 'recommended',
					options: [ { myOption: true } ]
				},
				{ config: 'strict' }
			],
			description: 'simple-rule.md: Basic features with default settings',
			expected: loadCase( 'cases/simple-rule.md' )
		},
		{
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
			description: 'no-fix-code-examples.md: No description, rule with `noDoc`, fixCodeExamples:false, showConfigComments:true',
			expected: loadCase( 'cases/no-fix-code-examples.md' )
		},
		{
			ruleMeta: {
				fixable: 'code'
			},
			tests: {
				valid: [],
				invalid: [
					{
						code: 'var x="1.23"',
						output: 'var x="123"'
					}
				]
			},
			config: {
				showConfigComments: true,
				fixCodeExamples: true
			},
			description: 'no-config-comments.md: No valid cases, fixCodeExamples:true, showConfigComments:true',
			expected: loadCase( 'cases/no-config-comments.md' )
		},
		{
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
			description: 'not-fixable.md: Rule not fixable, only docLink',
			expected: loadCase( 'cases/not-fixable.md' )
		}
	];
	it( 'test output', () => {
		cases.forEach( ( caseItem ) => {
			const output = buildDocsFromTests(
				caseItem.name || 'my-rule',
				caseItem.ruleMeta || {},
				caseItem.tests,
				caseItem.ruleData,
				Object.assign( {}, defaultConfig, caseItem.config ),
				caseItem.templates || defaultTemplates
			);

			assert.strictEqual( output, caseItem.expected, caseItem.description );
		} );
	} );
} );
