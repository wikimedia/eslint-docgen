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
				writeDocsFromTests( name, rule, tests, this.testerConfig, done );
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
