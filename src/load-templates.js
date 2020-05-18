const fs = require( 'fs' );
const path = require( 'path' );
const ejs = require( 'ejs' );

function loadTemplates( dirPath ) {
	const files = fs.readdirSync( dirPath );
	const templates = {};
	files.forEach( ( template ) => {
		templates[ path.parse( template ).name ] = ejs.compile(
			fs.readFileSync( path.join( dirPath, template ) ).toString()
		);
	} );
	return templates;
}

module.exports = loadTemplates;
