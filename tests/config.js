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
		assert.strictEqual( config.docPath, 'docs/{name}/README.md' );
		assert.strictEqual( config.ruleLink, true );
		assert.strictEqual( config.tabWidth, 4 );
		assert.deepEqual(
			validateConfig( config ),
			[
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
