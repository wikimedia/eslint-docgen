'use strict';

const simple = require( 'simple-mock' );

// eslint-disable-next-line mocha/no-top-level-hooks
afterEach( () => {
	// Un-mock
	simple.restore();
	// Clear require cache
	Object.keys( require.cache ).forEach( ( key ) => {
		delete require.cache[ key ];
	} );
} );
