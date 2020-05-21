const fs = require( 'fs' );
const packagePath = require( './package-path' );
const importFresh = require( 'import-fresh' );
const formatter = require( './formatter' );

const configFilenames = [
	'.eslintdocgenrc.js',
	'.eslintdocgenrc.json'
];

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
	console.log( formatter.heading( 'eslint-docgen' ) );
	console.log( '  ' + formatter.error( '.eslintdocgenrc not found' ) );
	process.exit( 1 );
}

const defaultConfig = require( './default-config.js' );
config = Object.assign( {}, defaultConfig, config );

const errors = [];
// Validation
if ( config.ruleLink && !config.rulePath ) {
	errors.push( 'rulePath must be set when ruleLink is true' );
}
if ( config.testLink && !config.testPath ) {
	errors.push( 'testPath must be set when testLink is true' );
}
if ( errors.length ) {
	console.log( formatter.heading( configPath ) );
	errors.forEach( ( error ) => console.log( '  ' + formatter.error( error ) ) );
	process.exit( 1 );
}

module.exports = config;
