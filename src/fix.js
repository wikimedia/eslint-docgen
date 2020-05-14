const eslint = require( 'eslint' );
const linter = new eslint.Linter();
const cli = new eslint.CLIEngine();
const config = cli.getConfigForFile( require( './main' ) );

// Restrict config used by verifyAndFix to fixable formatting rules
// TODO: Do this by looking at rule metadata
const formattingRuleNames = [ 'array-bracket-spacing', 'block-spacing', 'brace-style', 'comma-dangle', 'comma-spacing', 'comma-style', 'computed-property-spacing', 'curly', 'dot-location', 'dot-notation', 'func-call-spacing', 'indent', 'key-spacing', 'keyword-spacing', 'linebreak-style', 'no-extra-semi', 'no-irregular-whitespace', 'no-mixed-spaces-and-tabs', 'no-multi-spaces', 'no-regex-spaces', 'no-tabs', 'no-trailing-spaces', 'no-whitespace-before-property', 'object-curly-spacing', 'operator-linebreak', 'quote-props', 'quotes', 'semi', 'semi-spacing', 'semi-style', 'space-before-blocks', 'space-before-function-paren', 'space-in-parens', 'space-infix-ops', 'space-unary-ops', 'spaced-comment', 'switch-colon-spacing', 'template-curly-spacing', 'wrap-iife' ];
const formattingRules = {};
formattingRuleNames.forEach( function ( ruleName ) {
	formattingRules[ ruleName ] = config.rules[ ruleName ];
} );
config.rules = formattingRules;

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
