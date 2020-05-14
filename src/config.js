const fs = require( 'fs' );
const packagePath = require( './package-path' );
const importFresh = require( 'import-fresh' );

const configFilenames = [
	'.eslintdocgenrc.js',
	'.eslintdocgenrc.json'
];

let config;

configFilenames.some( ( configFilename ) => {
	const configPath = packagePath( configFilename );

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

// Validation
if ( config.ruleLink && !config.rulePath ) {
	throw new Error( 'rulePath must be set when ruleLink is true' );
}
if ( config.testLink && !config.testPath ) {
	throw new Error( 'testPath must be set when testLink is true' );
}

module.exports = config;
