'use strict';

// eslint-disable-next-line security/detect-non-literal-require
const main = require( require( './main' ) );
const pluginName = require( './get-config' )().pluginName;
const configs = main.configs;
const rulesWithConfig = new Map( Object.entries( main.rules ) );

// Add a configMap property to the rulesWithConfig
rulesWithConfig.forEach( ( rule, name ) => {
	rulesWithConfig.get( name ).configMap = new Map();
} );

/**
 * Check if a config is a duplicate of another config in a different format
 *
 * Plugins which support both eslintrc and flat config often export each config
 * twice, e.g. `recommended` and `flat/recommended`, or `recommended` and
 * `legacy-recommended`. Only list these once.
 *
 * @param {string} name Config name
 * @return {boolean}
 */
function isDuplicateConfig( name ) {
	const match = name.match( /^(?:flat\/|legacy-)(.*)$/ );
	return !!match && Object.prototype.hasOwnProperty.call( configs, match[ 1 ] );
}

/**
 * Get the rules set by a config
 *
 * @param {Object|Object[]} config eslintrc config, flat config, or flat config array
 * @return {Object} Rules
 */
function getRules( config ) {
	return Array.isArray( config ) ?
		Object.assign( {}, ...config.map( getRules ) ) :
		config.rules || {};
}

// Iterate over configs to add config data to map
for ( const name in configs ) {
	if ( isDuplicateConfig( name ) ) {
		continue;
	}
	const rules = getRules( configs[ name ] );
	for ( const fullName in rules ) {
		// Flat config arrays can include rules from other plugins
		if ( !fullName.startsWith( pluginName + '/' ) ) {
			continue;
		}
		// Configs use the full rule name with the plugin prefix, so remove this
		const shortName = fullName.slice( pluginName.length + 1 );
		let options, rawSeverity;

		if ( Array.isArray( rules[ fullName ] ) ) {
			options = rules[ fullName ].slice( 1 );
			rawSeverity = rules[ fullName ][ 0 ];
		} else {
			options = null;
			rawSeverity = rules[ fullName ];
		}
		const severityMap = [ 'off', 'warn', 'error' ];
		const severity = typeof rawSeverity === 'number' ?
			severityMap[ rawSeverity ] || 'error' :
			rawSeverity;

		rulesWithConfig.get( shortName ).configMap.set(
			name,
			{
				severity,
				options
			}
		);
	}
}

module.exports = rulesWithConfig;
