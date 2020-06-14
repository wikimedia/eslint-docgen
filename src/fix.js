'use strict';

const eslint = require( 'eslint' );
const linter = new eslint.Linter();
const cli = new eslint.CLIEngine();
const config = cli.getConfigForFile( require( './main' ) );
const rules = cli.getRules();
const mergeOptions = require( 'merge-options' );

// Optimization: Only use fixable rules
const fixableRules = {};
Object.keys( config.rules ).forEach( function ( ruleName ) {
	if ( rules.has( ruleName ) ) {
		const rule = rules.get( ruleName );
		if ( rule.meta.fixable ) {
			fixableRules[ ruleName ] = config.rules[ ruleName ];
		}
	}
} );
config.rules = fixableRules;

/**
 * Lint and fix some code
 *
 * @param {string} code Code
 * @param {Object} testerConfig Config
 * @return {string} Fixed code
 */
function lintFix( code, testerConfig ) {
	const mergedConfig = mergeOptions( config, testerConfig );

	// TODO
	// istanbul ignore next
	if ( testerConfig && typeof testerConfig.parser === 'string' ) {
		linter.defineParser( testerConfig.parser, require( testerConfig.parser ) );
	}

	const result = linter.verifyAndFix( code, mergedConfig );
	const err = result.messages.find( ( message ) => message.fatal );
	// TODO
	// istanbul ignore next
	if ( err ) {
		const line = code.split( '\n' )[ err.line - 1 ];
		throw new Error( err.message + ':\n' + line );
	}
	return result.output;
}

/**
 * Lint and fix a collection of code snippets
 *
 * Concatenates the code snippets into one code block to improve performance
 *
 * @param {string[]} codeList Code list
 * @param {Object} testerConfig Config
 * @return {string[]} Fixed code list
 */
function batchLintFix( codeList, testerConfig ) {
	const separator = '\n/* - */\n';
	const codeBlock = codeList.join( ';' + separator );
	// Add an extra semicolon to avoid syntax error
	return lintFix( codeBlock, testerConfig ).split( separator ).map( ( code ) => code.trim() );
}

module.exports = {
	lintFix: lintFix,
	batchLintFix: batchLintFix
};
