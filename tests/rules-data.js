const assert = require( 'assert' );
const testUtils = require( './test-utils' );

describe( 'rulesData', () => {
	it( 'rulesData', () => {
		testUtils.mockCwd( 'cases/plugin/src' );
		const rulesData = require( '../src/rules-data.js' );
		assert.deepEqual(
			rulesData,
			{
				'my-plugin/recommended-rule': [
					{
						config: 'recommended',
						options: [ { myOption: true } ]
					},
					{
						config: 'strict',
						options: null
					}
				]
			}
		);
	} );
} );
