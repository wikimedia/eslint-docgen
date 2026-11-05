'use strict';

// Flat config (ESLint 9) equivalent of .eslintrc.json in this directory
const { rules } = require( './.eslintrc.json' );

const flatRules = Object.assign( {}, rules );
// Flat config doesn't allow unknown rules, so use a rule from a stub plugin
// instead, to test that non-core rules are not used when fixing examples
delete flatRules[ 'some-plugin-rule' ];
flatRules[ 'some-plugin/some-rule' ] = 'error';

module.exports = [
	{
		plugins: {
			'some-plugin': {
				rules: {
					'some-rule': {
						meta: { fixable: 'code' },
						create: () => ( {} )
					}
				}
			}
		},
		rules: flatRules
	}
];
