const assert = require( 'assert' );

describe( 'formatter', () => {
	it( 'formatter', () => {
		const formatter = require( '../src/formatter' );
		assert.ok( formatter.warn( 'foo' ).match( /warning.*foo/ ) );
		assert.ok( formatter.error( 'bar' ).match( /error.*bar/ ) );
		assert.ok( formatter.heading( 'baz' ).match( /baz/ ) );
		assert.ok( formatter.warn( 'quux', 'whee' ).match( /warning.*quux.*whee/ ) );
		assert.ok( formatter.error( 'whee', 'quux' ).match( /error.*whee.*quux/ ) );
	} );
} );
