'use strict';

const { Linter, ESLint } = require( 'eslint' );
const linter = new Linter();
const eslint = new ESLint();
const mergeOptions = require( 'merge-options' );
// eslint-disable-next-line node/no-missing-require
const { builtinRules } = require( 'eslint/use-at-your-own-risk' );

async function getConfig() {
	const config = await eslint.calculateConfigForFile( require( './main' ) );

	// Optimization: Only use fixable rules
	const fixableRules = {};
	Object.keys( config.rules ).forEach( function ( ruleName ) {
		if ( builtinRules.has( ruleName ) ) {
			const rule = builtinRules.get( ruleName );
			if ( rule.meta.fixable ) {
				fixableRules[ ruleName ] = config.rules[ ruleName ];
			}
		}
	} );
	config.rules = fixableRules;

	return config;
}

/**
 * Lint and fix some code
 *
 * @param {string} code Code
 * @param {Object} testerConfig Config
 * @return {string} Fixed code
 */
async function lintFix( code, testerConfig ) {
	const mergedConfig = mergeOptions( await getConfig(), testerConfig );

	// TODO
	// istanbul ignore next
	if ( typeof mergedConfig.parser === 'string' ) {
		// eslint-disable-next-line security/detect-non-literal-require
		linter.defineParser( mergedConfig.parser, require( mergedConfig.parser ) );
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
async function batchLintFix( codeList, testerConfig ) {
	const separator = '\n/* - */\n';
	const codeBlock = codeList.join( ';' + separator );
	// Add an extra semicolon to avoid syntax error
	const fixed = await lintFix( codeBlock, testerConfig );
	return fixed.split( separator ).map( ( code ) => code.trim() );
}

module.exports = {
	lintFix: lintFix,
	batchLintFix: batchLintFix
};
