'use strict';

const plugin = {
	rules: {
		'recommended-rule': { meta: { docs: 'Recommended' } },
		'my-rule': { meta: { docs: 'My' } }
	},
	configs: {
		// eslintrc config
		recommended: {
			plugins: [ 'my-plugin' ],
			rules: {
				'my-plugin/recommended-rule': [ 'warn', { myOption: true } ]
			}
		},
		// Flat config array, which also sets rules from other plugins
		strict: [
			{
				rules: {
					'no-console': 'error',
					'my-plugin/recommended-rule': 'warn'
				}
			},
			{
				rules: {
					'my-plugin/recommended-rule': 'error'
				}
			}
		]
	}
};

// Flat duplicates of the configs above, which are not listed
plugin.configs[ 'flat/recommended' ] = {
	plugins: { 'my-plugin': plugin },
	rules: plugin.configs.recommended.rules
};
plugin.configs[ 'legacy-strict' ] = {
	plugins: [ 'my-plugin' ],
	rules: { 'my-plugin/recommended-rule': 'error' }
};
// Flat config without an eslintrc version
plugin.configs[ 'flat/all' ] = {
	plugins: { 'my-plugin': plugin },
	rules: { 'my-plugin/my-rule': 'error' }
};

module.exports = plugin;
