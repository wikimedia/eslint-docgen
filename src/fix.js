'use strict';

const { Linter, ESLint } = require( 'eslint' );
const linter = new Linter();
const eslint = new ESLint();
const mergeOptions = require( 'merge-options' );
const { builtinRules } = require( 'eslint/use-at-your-own-risk' );

async function getConfig() {
	const config = await eslint.calculateConfigForFile( require.resolve( './main' ) );

	// Optimization: Only use fixable rules
	const fixableRules = {};
	if ( config && config.rules ) {
		Object.keys( config.rules ).forEach( function ( ruleName ) {
			if ( builtinRules.has( ruleName ) ) {
				const rule = builtinRules.get( ruleName );
				if ( rule.meta && rule.meta.fixable ) {
					fixableRules[ ruleName ] = config.rules[ ruleName ];
				}
			}
		} );
		config.rules = fixableRules;
	}

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
	const baseConfig = await getConfig();

	// ESLint v9 compatibility: Extract only simple properties
	// Avoid complex nested objects that merge-options can't handle
	const mergeableBaseConfig = {
		rules: baseConfig.rules || {}
	};

	// Extract only the simple properties from languageOptions
	if ( baseConfig.languageOptions ) {
		mergeableBaseConfig.languageOptions = {};
		if ( baseConfig.languageOptions.ecmaVersion !== undefined ) {
			mergeableBaseConfig.languageOptions.ecmaVersion = baseConfig.languageOptions.ecmaVersion;
		}
		if ( baseConfig.languageOptions.sourceType !== undefined ) {
			mergeableBaseConfig.languageOptions.sourceType = baseConfig.languageOptions.sourceType;
		}
		// Skip globals and other complex properties
	}

	const mergedConfig = mergeOptions( mergeableBaseConfig, testerConfig || {} );

	// ESLint v9: Convert to proper flat config for Linter
	const linterConfig = {
		rules: mergedConfig.rules || {}
	};

	// Handle languageOptions (flat config format)
	if ( mergedConfig.languageOptions ) {
		linterConfig.languageOptions = { ...mergedConfig.languageOptions };
	}

	// Handle parser (convert string to module for ESLint v9)
	if ( typeof mergedConfig.parser === 'string' ) {
		// eslint-disable-next-line security/detect-non-literal-require
		const parserModule = require( mergedConfig.parser );
		if ( !linterConfig.languageOptions ) {
			linterConfig.languageOptions = {};
		}
		linterConfig.languageOptions.parser = parserModule;
	}

	// Handle legacy parserOptions (convert to languageOptions)
	if ( mergedConfig.parserOptions && !linterConfig.languageOptions ) {
		linterConfig.languageOptions = {
			ecmaVersion: mergedConfig.parserOptions.ecmaVersion,
			sourceType: mergedConfig.parserOptions.sourceType
		};
	}

	// Handle settings
	if ( mergedConfig.settings ) {
		linterConfig.settings = mergedConfig.settings;
	}

	const result = linter.verifyAndFix( code, linterConfig );
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
