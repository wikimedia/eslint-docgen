'use strict';

const fs = require( 'fs' );
const packagePath = require( './package-path' );
const importFresh = require( 'import-fresh' );

const configFilenames = [
	'.eslintdocgenrc.js',
	'.eslintdocgenrc.json'
];

/**
 * Get the eslintdocgenrc config from the current working directory
 *
 * Missing values are backfilled with the defaults
 *
 * @return {Object} Config
 */
function getConfig() {
	let config, configPath;

	configFilenames.some( ( configFilename ) => {
		configPath = packagePath( configFilename );

		if ( fs.existsSync( configPath ) ) {
			config = importFresh( configPath );
			return true;
		}
		return false;
	} );

	if ( !config ) {
		throw new Error( '.eslintdocgenrc not found' );
	}

	const defaultConfig = require( './default-config.js' );
	config = Object.assign( {}, defaultConfig, config );

	return {
		config: config,
		configPath: configPath
	};
}

module.exports = getConfig;
