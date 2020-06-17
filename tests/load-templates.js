'use strict';

const assert = require( 'assert' );
const path = require( 'upath' );

describe( 'loadTemplates', () => {
	it( 'Use invalid include', () => {
		const loadTemplates = require( '../src/load-templates' );
		const { globalTemplates } = loadTemplates( [ path.join( __dirname, 'cases/templates' ) ] );
		assert.throws( () => {
			globalTemplates.test();
		}, { message: /Template `doesNotExist` not found in template `test`/ } );
	} );
} );
