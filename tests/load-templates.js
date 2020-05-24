'use strict';

const assert = require( 'assert' );
const path = require( 'path' );

describe( 'loadTemplates', () => {
	const loadTemplates = require( '../src/load-templates' );

	it( 'Use invalid include', () => {
		const templates = loadTemplates( [ path.join( __dirname, 'cases/templates' ) ] );
		assert.throws( () => {
			templates.test();
		}, { message: /Template `doesNotExist` not found in template `test`/ } );
	} );
} );
