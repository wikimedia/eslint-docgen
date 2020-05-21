const assert = require( 'assert' );

describe( 'formatter', () => {
	it( 'formatter', () => {
		const formatter = require( '../src/formatter' );
		assert.strictEqual( formatter.warning( 'foo' ), '\u001b[33mwarning\u001b[39m foo' );
		assert.strictEqual( formatter.error( 'bar' ), '\u001b[31merror\u001b[39m bar' );
		assert.strictEqual( formatter.heading( 'baz' ), '\u001b[4mbaz\u001b[24m' );
	} );
} );
