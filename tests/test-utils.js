'use strict';

const path = require( 'path' );
const simple = require( 'simple-mock' );

function mockCwd( relativePath ) {
	simple.mock( process, 'cwd' ).returnWith( path.join( __dirname, relativePath ) );
}

module.exports = {
	mockCwd: mockCwd
};
