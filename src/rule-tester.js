'use strict';

const packagePath = require( './package-path' );
// Use plugin's version of ESLint
const ESLintRuleTester = require( packagePath( 'node_modules/eslint' ) ).RuleTester;
const docMode = !!process.env.DOCGEN || process.argv.includes( '--doc' );

if ( process.argv.includes( '--doc' ) ) {
	const formatter = require( './formatter' );
	console.log(
		formatter.warn( '--doc is deprecated, use the DOCGEN=1 environment variable instead.' )
	);
}

/**
 * Extends ESLint's RuleTester to also build documentation
 */
class RuleTester extends ESLintRuleTester {
	run( name, rule, tests ) {
		if ( docMode ) {
			RuleTester.it( name, ( done ) => {
				const writeDocsFromTests = require( './write-docs-from-tests' );
				writeDocsFromTests( name, rule, tests, this.testerConfig, done );
			} );
		} else {
			// Filter out invalid top level property "noDoc", used in documentation building mode
			tests.valid.forEach( ( test ) => {
				delete test.docgen;
				// Deprecated
				delete test.noDoc;
			} );
			tests.invalid.forEach( ( test ) => {
				delete test.docgen;
				// Deprecated
				delete test.noDoc;
			} );
			return super.run.call( this, name, rule, tests );
		}
	}
}

module.exports = RuleTester;
