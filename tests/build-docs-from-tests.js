const buildDocsFromTests = require( '../src/build-docs-from-tests' );
const assert = require( 'assert' );
const fs = require( 'fs' );
const path = require( 'path' );

describe( 'buildDocsFromTests', () => {
	const loadTemplates = require( '../src/load-templates' );
	const templates = loadTemplates( [ path.join( __dirname, '../src/templates' ) ] );
	const config = require( '../src/default-config' );

	config.rulePath = 'rules/{name}.js';
	config.testPath = 'tests/{name}.js';
	config.showConfigComments = true;

	function loadCase( filename ) {
		return fs.readFileSync( path.join( __dirname, filename ) ).toString();
	}

	const cases = [
		{
			name: 'simple-rule',
			ruleMeta: {
				docs: {
					description: 'My simple rule enforces a thing',
					deprecated: true,
					replacedBy: [ 'my-new-simple-rule', 'my-other-simple-rule' ]
				},
				fixable: 'code',
				schema: []
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
			config: config,
			templates: templates,
			expected: loadCase( 'cases/simple-rule.md' )
		}
	];
	it( 'test output', () => {
		cases.forEach( ( caseItem ) => {
			const output = buildDocsFromTests(
				caseItem.name,
				caseItem.ruleMeta,
				caseItem.tests,
				caseItem.ruleData,
				caseItem.config,
				caseItem.templates
			);

			assert.strictEqual( output, caseItem.expected );
		} );
	} );
} );
