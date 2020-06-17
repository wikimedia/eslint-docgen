'use strict';

const fs = require( 'fs' );
const path = require( 'upath' );
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

/**
 * Load templates from a list of paths
 *
 * @param {string[]} dirPaths Paths
 * @return {Object} Keyed object with compiled EJS templates (globalTemplates),
 *  and a function to load per-rule templates (loadRuleTemplate)
 */
function loadTemplates( dirPaths ) {
	const templateStrings = {};
	const globalTemplates = {};
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
				return globalTemplates[ path ]( mergedData );
			} );
	}

	Object.keys( templateStrings ).forEach( ( filename ) => {
		globalTemplates[ filename ] = compile( templateStrings[ filename ], filename );
	} );

	function loadRuleTemplate( path ) {
		return compile(
			fs.readFileSync( path ).toString()
		);
	}

	return { globalTemplates, loadRuleTemplate };
}

module.exports = loadTemplates;
