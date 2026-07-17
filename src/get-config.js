'use strict';

const fs = require( 'fs' );
const packagePath = require( './package-path' );
const importFresh = require( 'import-fresh' );
const validateConfig = require( './validate-config' );
const formatter = require( './formatter' );

const configFilenames = [
	'.eslintdocgenrc.js',
	'.eslintdocgenrc.json'
];

/**
 * Get the eslintdocgenrc config from the current working directory
 *
 * Missing values are backfilled with the defaults
 *
 * @returns {object} Config
 * @throws {Error} If no config file is found, or if the config is invalid
 */
function getConfig() {
	let config, configPath;

	configFilenames.some( ( configFilename ) => {
		configPath = packagePath( configFilename );

		// eslint-disable-next-line security/detect-non-literal-fs-filename
		if ( fs.existsSync( configPath ) ) {
			config = importFresh( configPath );
			return true;
		}
		return false;
	} );

	if ( !config ) {
		throw new Error( [ formatter.heading( 'eslint-docgen' ), formatter.error( '.eslintdocgenrc not found' ) ].join( '\n' ) );
	}

	const defaultConfig = require( './default-config.js' );
	config = Object.assign( {}, defaultConfig, config );

	const configErrors = validateConfig( config );
	if ( configErrors.length ) {
		throw new Error( [ formatter.heading( configPath ), ...configErrors.map( formatter.error ) ].join( '\n' ) );
	}

	return config;
}

module.exports = getConfig;
