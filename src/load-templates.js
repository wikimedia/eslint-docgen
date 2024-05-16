'use strict';

const fs = require( 'fs' );
const path = require( 'upath' );
const ejs = require( 'ejs' );

function loadTemplatesFromPath( dirPath ) {
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const files = fs.readdirSync( dirPath );
	const templates = {};
	files.forEach( ( filename ) => {
		templates[ path.parse( filename ).name ] =
			// eslint-disable-next-line security/detect-non-literal-fs-filename
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
			compiled( data, null, function ( template, includeData ) {
				const mergedData = Object.assign( {}, data, includeData );
				if ( !hasOwn.call( templateStrings, template ) ) {
					throw new Error( 'Template `' + template + '` not found in template `' + filename + '`' );
				}
				return globalTemplates[ template ]( mergedData );
			} );
	}

	Object.keys( templateStrings ).forEach( ( filename ) => {
		globalTemplates[ filename ] = compile( templateStrings[ filename ], filename );
	} );

	function loadRuleTemplate( ruleTemplatePath ) {
		return compile(
			// eslint-disable-next-line security/detect-non-literal-fs-filename
			fs.readFileSync( ruleTemplatePath ).toString()
		);
	}

	return { globalTemplates, loadRuleTemplate };
}

module.exports = loadTemplates;
