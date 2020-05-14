const eslint = require( 'eslint' );
const linter = new eslint.Linter();
const cli = new eslint.CLIEngine();
const config = cli.getConfigForFile( require( './main' ) );
const rules = cli.getRules();

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

function lintFix( code ) {
	return linter.verifyAndFix( code, config ).output;
}

function batchLintFix( codeList ) {
	// Concatentate into one code block to improve performance
	const separator = '\n/* - */\n';
	const codeBlock = codeList.join( ';' + separator );
	// Add an extra semicolon to avoid syntax error
	return lintFix( codeBlock ).split( separator ).map( ( code ) => code.trim() );
}

module.exports = {
	lintFix: lintFix,
	batchLintFix: batchLintFix
};
