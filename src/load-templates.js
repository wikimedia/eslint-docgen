const fs = require( 'fs' );
const path = require( 'path' );

function loadTemplates( dirPath ) {
	const files = fs.readdirSync( dirPath );
	const templates = {};
	files.forEach( ( template ) => {
		templates[ path.parse( template ).name ] =
			fs.readFileSync( path.join( dirPath, template ) ).toString();
	} );
	return templates;
}

module.exports = loadTemplates;
