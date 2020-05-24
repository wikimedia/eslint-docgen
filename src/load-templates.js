'use strict';

const fs = require( 'fs' );
const path = require( 'path' );
const ejs = require( 'ejs' );

function loadTemplatesFromPath( dirPath ) {
	const files = fs.readdirSync( dirPath );
	const templates = {};
	files.forEach( ( filename ) => {
		templates[ path.parse( filename ).name ] =
			fs.readFileSync( path.join( dirPath, filename ) ).toString();
	} );
	return templates;
}

function loadTemplates( dirPaths ) {
	const templateStrings = {};
	const templates = {};
	dirPaths.forEach( ( dirPath ) => {
		Object.assign( templateStrings, loadTemplatesFromPath( dirPath ) );
	} );
	const hasOwn = Object.prototype.hasOwnProperty;

	function compile( string, filename ) {
		const compiled = ejs.compile( string, { client: true } );
		return ( data ) =>
			compiled( data, null, function ( path, includeData ) {
				const mergedData = Object.assign( {}, data, includeData );
				if ( !hasOwn.call( templateStrings, path ) ) {
					throw new Error( 'Template `' + path + '` not found in template `' + filename + '`' );
				}
				return templates[ path ]( mergedData );
			} );
	}

	Object.keys( templateStrings ).forEach( ( filename ) => {
		templates[ filename ] = compile( templateStrings[ filename ], filename );
	} );

	return templates;
}

module.exports = loadTemplates;
