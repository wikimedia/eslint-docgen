'use strict';

const simple = require( 'simple-mock' );

afterEach( () => {
	// Un-mock
	simple.restore();
	// Clear require cache
	Object.keys( require.cache ).forEach( ( key ) => {
		delete require.cache[ key ];
	} );
} );
