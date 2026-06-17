'use strict';

const assert = require( 'assert' );
const fs = require( 'fs' );
const path = require( 'upath' );
const buildReadme = require( '../src/build-readme' );

/* eslint-disable mocha/no-setup-in-describe */

describe( 'buildReadme', () => {
	const config = {
		pluginName: 'my-plugin',
		docPath: 'docs/{name}.md',
		readmeTemplate: 'README.md.template'
	};

	function loadCase( filename ) {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		return fs.readFileSync( path.join( __dirname, 'cases', filename ) ).toString();
	}

	const template = loadCase( 'build-readme.md.template' );

	it( 'builds rule lists with badges, configs and deprecations', () => {
		const rulesWithConfig = new Map( Object.entries( {
			// Has a schema (⚙️), is fixable (🔧) and is enabled in two configs,
			// one with options (†) and one without.
			'my-rule': {
				meta: {
					docs: { description: 'My rule' },
					schema: [ { type: 'object' } ],
					fixable: 'code'
				},
				configMap: new Map( Object.entries( {
					recommended: { severity: 'warn', options: [ { myOption: true } ] },
					strict: { severity: 'error', options: null }
				} ) )
			},
			// Plain rule: no schema, not fixable, not in any config.
			'plain-rule': {
				meta: {
					docs: { description: 'Plain rule' },
					schema: [],
					fixable: false
				},
				configMap: new Map()
			},
			// Deprecated rule, replaced by another rule.
			'deprecated-old-rule': {
				meta: {
					docs: { deprecated: true, replacedBy: 'my-rule' },
					schema: [],
					fixable: false
				},
				configMap: new Map()
			}
		} ) );

		assert.strictEqual(
			buildReadme( config, rulesWithConfig, template ),
			loadCase( 'build-readme.md' )
		);
	} );

	it( 'strips the deprecated- prefix from config names', () => {
		const rulesWithConfig = new Map( Object.entries( {
			'my-rule': {
				meta: {
					docs: { description: 'My rule' },
					schema: [],
					fixable: false
				},
				configMap: new Map( Object.entries( {
					'deprecated-1.5': { severity: 'error', options: null },
					'deprecated-1.3': { severity: 'warn', options: null }
				} ) )
			}
		} ) );

		assert.strictEqual(
			buildReadme( config, rulesWithConfig, template ),
			loadCase( 'build-readme-deprecated-config.md' )
		);
	} );
} );
