const assert = require( 'assert' );
const fs = require( 'fs' );
const path = require( 'path' );
const testUtils = require( './test-utils' );

describe( 'buildDocsFromTests', () => {
	it( 'test output', () => {
		testUtils.mockCwd( 'cases/plugin/src' );

		const buildDocsFromTests = require( '../src/build-docs-from-tests' );
		const loadTemplates = require( '../src/load-templates' );
		const defaultTemplates = loadTemplates( [ path.join( __dirname, '../src/templates' ) ] );
		const defaultConfig = require( '../src/default-config' );

		const noDesc = { type: 'warn', text: 'No description found in rule metadata' };

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
					fixCodeExamples: false,
					minExamples: [ 'warn', 1 ],
					maxExamples: [ 'error', 3 ]
				},
				description: 'no-fix-code-examples.md: No description, rule with `noDoc`, fixCodeExamples:false, showConfigComments:true',
				messages: [
					noDesc,
					{
						type: 'error',
						text: '5 examples found, expected fewer than 3.',
						label: 'config.maxExamples'
					}
				],
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
				messages: [ noDesc ],
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
				messages: [
					noDesc,
					{
						type: 'warn',
						text: '1 example found, expected at least 2.',
						label: 'config.minExamples'
					}
				],
				expected: loadCase( 'cases/not-fixable.md' )
			}
		];

		cases.forEach( ( caseItem ) => {
			const { output, messages } = buildDocsFromTests(
				caseItem.name || 'my-rule',
				caseItem.ruleMeta || {},
				caseItem.tests,
				caseItem.ruleData,
				Object.assign( {}, defaultConfig, caseItem.config ),
				caseItem.templates || defaultTemplates
			);

			assert.strictEqual( output, caseItem.expected, caseItem.description + ': output' );
			assert.deepEqual( messages, caseItem.messages || [], caseItem.description + ': messages' );
		} );
	} );
} );
