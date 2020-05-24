'use strict';

const path = require( 'path' );
const fs = require( 'fs' );

let dir = process.cwd();

while ( dir !== '/' && !fs.existsSync( dir + '/package.json' ) ) {
	dir = path.dirname( dir );
}

function packagePath( p ) {
	return path.join( dir, p );
}

module.exports = packagePath;
