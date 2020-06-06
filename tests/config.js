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
				'instance.docPath is not of a type(s) string',
				'instance.docLink is not of a type(s) boolean',
				'instance.ruleLink is not of a type(s) boolean',
				'instance.testLink is not of a type(s) boolean',
				'instance.minExamples is not any of [subschema 0],[subschema 1]',
				'instance.maxExamples is not any of [subschema 0],[subschema 1]',
				'instance additionalProperty "additionalProperty" exists in instance when not allowed',
				'rulePath must be set when ruleLink is true',
				'testPath must be set when testLink is true'
			]
		);
	} );

	it( 'missing config', () => {
		testUtils.mockCwd( 'cases/plugin-missing-config' );
		const getConfig = require( '../src/get-config.js' );
		assert.throws( () => {
			getConfig();
		}, { message: /.eslintdocgenrc not found/ } );
	} );
} );
