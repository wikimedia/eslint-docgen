'use strict';

const packagePath = require( './package-path' );
// Use plugin's version of ESLint
const ESLintRuleTester = require( packagePath( 'node_modules/eslint' ) ).RuleTester;
const inDocMode = !!process.env.DOCGEN;

/**
 * Extends ESLint's RuleTester to also build documentation
 */
class RuleTester extends ESLintRuleTester {
	run( name, rule, tests ) {
		if ( inDocMode ) {
			RuleTester.it( name, ( done ) => {
				const writeDocsFromTests = require( './write-docs-from-tests' );

				// ESLint v9 compatibility: testerConfig is an array in v9
				// Extract the first element (user config) for docgen
				let config = this.testerConfig;
				if ( Array.isArray( config ) && config.length > 0 ) {
					config = config[ 0 ];
				}

				writeDocsFromTests( name, rule, tests, config, done );
			} );
		} else {
			// Filter out invalid property "docgen"
			// (used in documentation building mode).
			tests.valid.forEach( ( test ) => {
				delete test.docgen;
			} );
			tests.invalid.forEach( ( test ) => {
				delete test.docgen;
			} );

			// Filter out invalid top level property "docgenConfig"
			// (used in documentation building mode).
			delete tests.docgenConfig;

			return super.run.call( this, name, rule, tests );
		}
	}
}

module.exports = RuleTester;
