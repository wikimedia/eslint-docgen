'use strict';

const main = require( require( './main' ) );
const pluginName = require( './get-config' )().config.pluginName;
const configs = main.configs;
const rulesWithConfig = new Map( Object.entries( main.rules ) );

// Add a configMap property to the rulesWithConfig
rulesWithConfig.forEach( ( rule, name ) => {
	rulesWithConfig.get( name ).configMap = new Map();
} );

// Iterate over configs to add config data to map
for ( const name in configs ) {
	const rules = configs[ name ].rules || {};
	for ( const fullName in rules ) {
		// Configs use the full rule name with the plugin prefix, so remove this
		const shortName = fullName.slice( pluginName.length + 1 );
		rulesWithConfig.get( shortName ).configMap.set(
			name,
			Array.isArray( rules[ fullName ] ) ? rules[ fullName ].slice( 1 ) : null
		);
	}
}

module.exports = rulesWithConfig;
