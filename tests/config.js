const assert = require( 'assert' );
const testUtils = require( './test-utils' );

describe( 'config', () => {
	it( 'config', () => {
		testUtils.mockCwd( 'cases/plugin/src' );
		const config = require( '../src/config.js' );
		assert.strictEqual( config.docPath, 'docs/{name}/README.md' );
		assert.strictEqual( config.tabWidth, 4 );
	} );
} );
