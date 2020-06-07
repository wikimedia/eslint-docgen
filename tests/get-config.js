'use strict';

const assert = require( 'assert' );
const testUtils = require( './test-utils' );

describe( 'getConfig', () => {
	it( 'simple config', () => {
		testUtils.mockCwd( 'cases/plugin/src' );
		const { config } = require( '../src/get-config.js' )();
		assert.deepEqual(
			config,
			{
				pluginName: 'my-plugin',
				fixCodeExamples: true,
				showConfigComments: false,
				showFixExamples: true,
				tabWidth: 4,
				templatePath: null,
				docPath: 'docs/{name}/README.md',
				rulePath: null,
				testPath: null,
				docLink: false,
				ruleLink: false,
				testLink: false,
				minExamples: [ 'warn', 2 ],
				maxExamples: [ 'warn', 50 ]
			}
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
