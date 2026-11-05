'use strict';

const assert = require( 'assert' );
const testUtils = require( './test-utils' );

describe( 'rulesWithConfig', () => {
	it( 'rulesWithConfig', () => {
		testUtils.mockCwd( 'cases/plugin/src' );
		const rulesWithConfig = require( '../src/rules-with-config.js' );
		const expected = new Map( Object.entries( {
			'recommended-rule': {
				meta: { docs: 'Recommended' },
				configMap: new Map( Object.entries( {
					recommended: {
						options: [ { myOption: true } ],
						severity: 'warn'
					},
					strict: {
						options: null,
						severity: 'error'
					}
				} ) )
			},
			'my-rule': {
				meta: { docs: 'My' },
				configMap: new Map()
			}
		} ) );
		assert.deepEqual(
			rulesWithConfig,
			expected
		);
	} );

	it( 'rulesWithConfig with flat configs', () => {
		testUtils.mockCwd( 'cases/plugin-flat/src' );
		const rulesWithConfig = require( '../src/rules-with-config.js' );
		const expected = new Map( Object.entries( {
			'recommended-rule': {
				meta: { docs: 'Recommended' },
				// 'flat/recommended' and 'legacy-strict' are duplicates, so not listed
				configMap: new Map( Object.entries( {
					recommended: {
						options: [ { myOption: true } ],
						severity: 'warn'
					},
					// Later config objects in an array override earlier ones
					strict: {
						options: null,
						severity: 'error'
					}
				} ) )
			},
			'my-rule': {
				meta: { docs: 'My' },
				configMap: new Map( Object.entries( {
					// Flat config with no eslintrc equivalent
					'flat/all': {
						options: null,
						severity: 'error'
					}
				} ) )
			}
		} ) );
		assert.deepEqual(
			rulesWithConfig,
			expected
		);
	} );
} );
