const assert = require( 'assert' );

describe( 'formatter', () => {
	it( 'formatter', () => {
		const formatter = require( '../src/formatter' );
		assert.ok( formatter.warning( 'foo' ).match( /warning.*foo/ ) );
		assert.ok( formatter.error( 'bar' ).match( /error.*bar/ ) );
		assert.ok( formatter.heading( 'baz' ).match( /baz/ ) );
	} );
} );
