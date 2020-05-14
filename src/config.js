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

module.exports = config;
