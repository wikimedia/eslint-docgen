module.exports = {
	rules: {
		'my-plugin/recommended-rule': {},
		'my-plugin/my-rule': {},
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
