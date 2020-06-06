'use strict';

const assert = require( 'assert' );
const testUtils = require( './test-utils' );

describe( 'getConfig/validateConfig', () => {
	it( 'config', () => {
		testUtils.mockCwd( 'cases/plugin/src' );
		const { config } = require( '../src/get-config.js' )();
		const validateConfig = require( '../src/validate-config.js' );
		assert.strictEqual( config.docPath, 'docs/{name}/README.md' );
		assert.strictEqual( config.ruleLink, false );
		assert.strictEqual( config.tabWidth, 4 );
		assert.deepEqual( validateConfig( config ), [] );
	} );

	it( 'broken config', () => {
		testUtils.mockCwd( 'cases/plugin-broken-config' );
		const { config } = require( '../src/get-config.js' )();
		const validateConfig = require( '../src/validate-config.js' );
		assert.deepEqual(
			validateConfig( config ),
			[
				'instance.pluginName is not of a type(s) string',
				'instance.fixCodeExamples is not of a type(s) boolean',
				'instance.showConfigComments is not of a type(s) boolean',
				'instance.showFixExamples is not of a type(s) boolean',
				'instance.tabWidth is not of a type(s) integer',
				'instance.tabWidth must have a minimum value of 0',
				'instance.templatePath is not of a type(s) string,null',
				'instance.docPath must contain "{name}"',
				'instance.rulePath must contain "{name}" or be null',
				'instance.testPath must contain "{name}" or be null',
				'instance.docLink is not of a type(s) boolean',
				'instance.ruleLink is not of a type(s) boolean',
				'instance.testLink is not of a type(s) boolean',
				'instance.minExamples must be a tuple containing "warn"/"error" and a positive integer, or be null',
				'instance.maxExamples must be a tuple containing "warn"/"error" and a positive integer, or be null',
				'instance additionalProperty "additionalProperty" exists in instance when not allowed'
			]
		);
	} );

	it( 'ruleLink but no rulePath', () => {
		const validateConfig = require( '../src/validate-config.js' );
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
		const validateConfig = require( '../src/validate-config.js' );
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

	it( 'missing config', () => {
		testUtils.mockCwd( 'cases/plugin-missing-config' );
		const getConfig = require( '../src/get-config.js' );
		assert.throws( () => {
			getConfig();
		}, { message: /.eslintdocgenrc not found/ } );
	} );
} );
