module.exports = {
	rules: {
		'recommended-rule': { meta: { docs: 'Recommended' } },
		'my-rule': { meta: { docs: 'My' } },
	},
	configs: {
		recommended: {
			rules: {
				'my-plugin/recommended-rule': [ 'error', { myOption: true } ]
			}
		},
		strict: {
			rules: {
				'my-plugin/recommended-rule': 'error'
			}
		},
		all: {
			extends: [ 'my-plugin/strict', 'my-plugin/recommended' ]
		}
	}
};
