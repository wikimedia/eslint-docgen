'use strict';

const assert = require( 'assert' );
const validateConfig = require( '../src/validate-config.js' );

describe( 'validateConfig', () => {
	it( 'default config with valid paths', () => {
		const defaultConfig = require( '../src/default-config.js' );
		const result = validateConfig( Object.assign( {}, defaultConfig, {
			docPath: 'docs/rules/{name}.md',
			rulePath: 'rules/{name}.md',
			testPath: 'tests/rules/{name}.md'
		} ) );
		assert.deepEqual(
			result,
			[]
		);
	} );

	it( 'various bad config values', () => {
		assert.deepEqual(
			validateConfig( {
				pluginName: false,
				fixCodeExamples: 3,
				showConfigComments: 'string',
				showFixExamples: {},
				tabWidth: -1.5,
				docPath: 1,
				rulePath: '',
				testPath: '',
				templatePath: 'foo',
				ruleTemplatePath: 'no-name-{param}',
				globalTemplatePath: false,
				docLink: '',
				ruleLink: 'true',
				testLink: 'true',
				excludeExamplesByDefault: [],
				minExamples: [ 'info', 3 ],
				maxExamples: [ 'error', -2 ],
				additionalProperty: 'foo'
			} ),
			[
				'instance.pluginName is not of a type(s) string',
				'instance.fixCodeExamples is not of a type(s) boolean',
				'instance.showConfigComments is not of a type(s) boolean',
				'instance.showFixExamples is not of a type(s) boolean',
				'instance.tabWidth is not of a type(s) integer',
				'instance.tabWidth must have a minimum value of 0',
				'instance.docPath is not of a type(s) string',
				'instance.rulePath must contain "{name}" or be null',
				'instance.testPath must contain "{name}" or be null',
				'instance.ruleTemplatePath must contain "{name}" or be null',
				'instance.globalTemplatePath is not of a type(s) string,null',
				'instance.templatePath must be renamed to "globalTemplatePath"',
				'instance.docLink is not of a type(s) boolean',
				'instance.ruleLink is not of a type(s) boolean',
				'instance.testLink is not of a type(s) boolean',
				'instance.excludeExamplesByDefault is not of a type(s) boolean',
				'instance.minExamples must be a tuple containing "warn"/"error" and a positive integer, or be null',
				'instance.maxExamples must be a tuple containing "warn"/"error" and a positive integer, or be null',
				'instance additionalProperty "additionalProperty" exists in instance when not allowed'
			]
		);
	} );

	it( 'ruleLink but no rulePath', () => {
		const defaultConfig = require( '../src/default-config.js' );
		const result = validateConfig( Object.assign( {}, defaultConfig, {
			docPath: 'docs/{name}.md',
			ruleLink: true,
			testLink: false
		} ) );
		assert.deepEqual( result, [
			'instance does not match allOf schema [subschema 0] with 1 error[s]:',
			'instance does not have rulePath when ruleLink is true'
		] );
	} );

	it( 'testLink but no testPath', () => {
		const defaultConfig = require( '../src/default-config.js' );
		const result = validateConfig( Object.assign( {}, defaultConfig, {
			docPath: 'docs/{name}.md',
			ruleLink: false,
			testLink: true
		} ) );
		assert.deepEqual( result, [
			'instance does not match allOf schema [subschema 1] with 1 error[s]:',
			'instance does not have testPath when testLink is true'
		] );
	} );
} );
