'use strict';

const requireESLint = require( './eslint' );
const { Linter, ESLint, loadESLint } = requireESLint();
const { builtinRules } = requireESLint( 'use-at-your-own-risk' );
const mergeOptions = require( 'merge-options' );

/**
 * ESLint 9+'s RuleTester only supports flat config, so test cases and the
 * tester config are in flat config format.
 */
const isFlatRuleTester = parseInt( Linter.version, 10 ) >= 9;

const linter = new Linter( { configType: isFlatRuleTester ? 'flat' : 'eslintrc' } );

/**
 * Get the plugin's ESLint config for its main file, normalized to a format
 * which doesn't depend on the config system used
 *
 * Only fixable core rules are kept, as plugin rules would need the plugin to
 * be loaded, and only fixes are needed.
 *
 * @return {Promise<Object>} Normalized config
 */
async function getConfig() {
	// loadESLint (ESLint 8.57+) returns the class for the config system used
	// by the plugin, i.e. depending on whether it has an eslint.config.js file
	const ESLintClass = loadESLint ? await loadESLint() : ESLint;
	const eslint = new ESLintClass();
	const config = await eslint.calculateConfigForFile( require( './main' ) ) || {};
	const isFlatConfig = ESLintClass.configType === 'flat';
	const languageOptions = ( isFlatConfig ? config.languageOptions : config.parserOptions ) || {};

	const rules = {};
	Object.keys( config.rules || {} ).forEach( ( ruleName ) => {
		if ( builtinRules.has( ruleName ) ) {
			const rule = builtinRules.get( ruleName );
			if ( rule.meta.fixable ) {
				rules[ ruleName ] = config.rules[ ruleName ];
			}
		}
	} );

	return {
		rules,
		settings: config.settings,
		// eslintrc only, can set the ecmaVersion, e.g. "es2017"
		env: config.env,
		// Parser name/path (eslintrc) or object (flat config)
		parser: isFlatConfig ? languageOptions.parser : config.parser,
		parserOptions: isFlatConfig ? languageOptions.parserOptions : config.parserOptions,
		ecmaVersion: languageOptions.ecmaVersion,
		sourceType: languageOptions.sourceType
	};
}

/**
 * Get a flat config array, for linting with ESLint 9+
 *
 * @param {Object} config Normalized config, from #getConfig
 * @param {Object|Object[]} testerConfig RuleTester config
 * @return {Object[]} Flat config array
 */
function getFlatConfig( config, testerConfig ) {
	const baseConfig = {
		rules: config.rules,
		languageOptions: {}
	};
	if ( config.settings ) {
		baseConfig.settings = config.settings;
	}
	[ 'ecmaVersion', 'sourceType', 'parserOptions' ].forEach( ( key ) => {
		if ( config[ key ] !== undefined ) {
			baseConfig.languageOptions[ key ] = config[ key ];
		}
	} );
	if ( config.parser ) {
		baseConfig.languageOptions.parser = typeof config.parser === 'string' ?
			// eslint-disable-next-line security/detect-non-literal-require
			require( config.parser ) :
			config.parser;
	}
	// The RuleTester config may include rules which aren't loaded here,
	// e.g. "rule-tester/validate-ast", and rules aren't needed for fixing.
	const testerConfigs = [].concat( testerConfig || [] ).map( ( testerConfigItem ) => {
		const copy = Object.assign( {}, testerConfigItem );
		delete copy.rules;
		return copy;
	} );
	return [ baseConfig, ...testerConfigs ];
}

/**
 * Get an eslintrc config, for linting with ESLint 8
 *
 * @param {Object} config Normalized config, from #getConfig
 * @param {Object} testerConfig RuleTester config
 * @return {Object} eslintrc config
 */
function getEslintrcConfig( config, testerConfig ) {
	const baseConfig = {
		rules: config.rules,
		parserOptions: Object.assign( {}, config.parserOptions )
	};
	if ( config.settings ) {
		baseConfig.settings = config.settings;
	}
	if ( config.env ) {
		baseConfig.env = config.env;
	}
	[ 'ecmaVersion', 'sourceType' ].forEach( ( key ) => {
		if ( config[ key ] !== undefined ) {
			baseConfig.parserOptions[ key ] = config[ key ];
		}
	} );
	if ( config.parser ) {
		baseConfig.parser = config.parser;
	}

	const mergedConfig = mergeOptions( baseConfig, testerConfig );

	if ( mergedConfig.parser && typeof mergedConfig.parser !== 'string' ) {
		// A parser object, from an ESLint 8.57 flat config
		linter.defineParser( 'eslint-docgen-parser', mergedConfig.parser );
		mergedConfig.parser = 'eslint-docgen-parser';
	} else if ( typeof mergedConfig.parser === 'string' ) {
		// eslint-disable-next-line security/detect-non-literal-require
		linter.defineParser( mergedConfig.parser, require( mergedConfig.parser ) );
	}

	return mergedConfig;
}

/**
 * Lint and fix some code
 *
 * @param {string} code Code
 * @param {Object|Object[]} testerConfig RuleTester config
 * @return {string} Fixed code
 */
async function lintFix( code, testerConfig ) {
	const config = await getConfig();

	const result = isFlatRuleTester ?
		linter.verifyAndFix( code, getFlatConfig( config, testerConfig ), { filename: 'example.js' } ) :
		linter.verifyAndFix( code, getEslintrcConfig( config, testerConfig ) );

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
 * @param {Object|Object[]} testerConfig RuleTester config
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
