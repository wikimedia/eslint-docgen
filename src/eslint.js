'use strict';

const packagePath = require( './package-path' );

/**
 * Load a module from the plugin's copy of ESLint
 *
 * Docs should be built with the same version of ESLint, and the same config
 * system, as the plugin's tests are run with.
 *
 * @param {string} [subpath] Module path within the ESLint package, e.g. 'use-at-your-own-risk'
 * @return {Object} Module exports
 */
function requireESLint( subpath ) {
	const name = subpath ? 'eslint/' + subpath : 'eslint';
	// eslint-disable-next-line security/detect-non-literal-require
	return require( require.resolve( name, { paths: [ packagePath( '.' ) ] } ) );
}

module.exports = requireESLint;
