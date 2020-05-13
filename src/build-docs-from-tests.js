const ejs = require( 'ejs' );
const path = require( 'path' );
const eslint = require( 'eslint' );
const linter = new eslint.Linter();
const fs = require( 'fs' );
const rulePath = 'src/rules/{name}.js';
const docPath = 'docs/{name}.md';

const rulesData = require( './rules-data' );
const cli = new eslint.CLIEngine();
const config = cli.getConfigForFile( require( './main' ) );

const packagePath = require( './package-path' );
const pluginName = require( packagePath( './package' ) ).name.replace( 'eslint-plugin-', '' );

// Restrict config used by verifyAndFix to fixable formatting rules
// TODO: Do this by looking at rule metadata
const formattingRuleNames = [ 'array-bracket-spacing', 'block-spacing', 'brace-style', 'comma-dangle', 'comma-spacing', 'comma-style', 'computed-property-spacing', 'curly', 'dot-location', 'dot-notation', 'func-call-spacing', 'indent', 'key-spacing', 'keyword-spacing', 'linebreak-style', 'no-extra-semi', 'no-irregular-whitespace', 'no-mixed-spaces-and-tabs', 'no-multi-spaces', 'no-regex-spaces', 'no-tabs', 'no-trailing-spaces', 'no-whitespace-before-property', 'object-curly-spacing', 'operator-linebreak', 'quote-props', 'quotes', 'semi', 'semi-spacing', 'semi-style', 'space-before-blocks', 'space-before-function-paren', 'space-in-parens', 'space-infix-ops', 'space-unary-ops', 'spaced-comment', 'switch-colon-spacing', 'template-curly-spacing', 'wrap-iife' ];
const formattingRules = {};
formattingRuleNames.forEach( function ( ruleName ) {
	formattingRules[ ruleName ] = config.rules[ ruleName ];
} );
config.rules = formattingRules;

const templates = {};
[
	'config',
	'deprecated',
	'fixable',
	'index',
	'replacedBy'
].forEach( ( template ) => {
	templates[ template ] = fs.readFileSync( path.join( __dirname, './templates/' + template + '.ejs' ) ).toString();
} );

function mdLink( target, label ) {
	return '[' + label + '](' + target + ')';
}

function buildRuleDetails( tests, icon, showFixes ) {

	function lintFixList( codeList ) {
		// Concatentate into one code block to improve performance
		const separator = '\n/* - */\n';
		const codeBlock = codeList.join( ';' + separator );
		// Add an extra semicolon to avoid syntax error
		return linter.verifyAndFix( codeBlock, config ).output
			.split( separator ).map( ( code ) => code.trim() );
	}

	let output = '';
	let maxCodeLength;
	const testsByOptions = {};

	const fixedCode = lintFixList( tests.map( ( test ) => typeof test === 'string' ? test : test.code ) );

	let fixedOutput;
	if ( showFixes ) {
		maxCodeLength = fixedCode.reduce( function ( acc, code ) {
			return Math.max( acc, code.length );
		}, 0 );
		fixedOutput = lintFixList( tests.map( ( test ) => test.output || 'null' ) );
	}

	tests.forEach( function ( test, i ) {
		let options = '';
		const code = fixedCode[ i ];

		if ( test.noDoc ) {
			return;
		}
		if ( test.options || test.settings ) {
			options = JSON.stringify( {
				options: test.options,
				settings: test.settings
			} );
		}
		testsByOptions[ options ] = testsByOptions[ options ] || [];
		if ( showFixes && test.output ) {
			testsByOptions[ options ].push(
				code + ' '.repeat( Math.max( 0, maxCodeLength - code.length ) ) +
				' /* → */ ' +
				fixedOutput[ i ]
			);
		} else {
			testsByOptions[ options ].push( code );
		}
	} );

	for ( const options in testsByOptions ) {
		if ( options ) {
			const optionsAndSettings = JSON.parse( options );
			output += icon + ' With';
			if ( optionsAndSettings.options ) {
				output += ' `' + JSON.stringify( optionsAndSettings.options ) + '` options';
			}
			if ( optionsAndSettings.settings ) {
				if ( optionsAndSettings.options ) {
					output += ' and';
				}
				output += ' `' + JSON.stringify( optionsAndSettings.settings ) + '` settings';
			}
			output += ':\n';
		}
		output += '```js\n';
		output += testsByOptions[ options ].join( '\n' );
		output += '\n```\n';
	}

	return output;
}

function buildDocsFromTests( name, rule, tests ) {
	let config = '',
		description = '',
		deprecated = '',
		fixable = '';

	if ( rule.meta.docs.description ) {
		description = rule.meta.docs.description;
	} else {
		console.warn( 'Rule ' + name + ' has no description.' );
	}

	if ( rule.meta.docs.deprecated ) {
		let replacedBy = '';
		if ( rule.meta.docs.replacedBy ) {
			const ruleLinks = rule.meta.docs.replacedBy.map( ( name ) => mdLink( name + '.md', '`' + name + '`' ) ).join( ', ' );
			replacedBy = ejs.render( templates.replacedBy, { ruleLinks: ruleLinks } );
		}
		deprecated = ejs.render( templates.deprecated, { replacedBy: replacedBy } ).trim();
	}

	if ( name in rulesData ) {
		config += rulesData[ name ].map( ( data ) => {
			const configDesc = '`plugin:' + pluginName + '/' + data.ruleset + '`' +
				// TODO: Create util to compare options to defaults
				( data.options && Object.keys( data.options[ 0 ] ).length ?
					' with `' + JSON.stringify( data.options ) + '` options' :
					'' );
			return ejs.render( templates.config, { configDesc: configDesc } );
		} ).join( '\n\n' );
	}

	const invalid = buildRuleDetails( tests.invalid, '❌' );

	const valid = buildRuleDetails( tests.valid, '✔️' );

	if ( rule.meta.fixable ) {
		const fixes = buildRuleDetails( tests.invalid.filter( ( test ) => !!test.output ), '🔧', true );
		fixable = ejs.render( templates.fixable, { fixes: fixes } );
	}

	const path = rulePath.replace( '{name}', name );

	const sourceLink = mdLink( '/' + path, path );

	const output = ejs.render( templates.index, {
		config: config,
		deprecated: deprecated,
		description: description,
		fixable: fixable,
		invalid: invalid,
		sourceLink: sourceLink,
		title: name,
		valid: valid
	} ).replace( /\n{3,}/g, '\n\n' );

	fs.writeFile(
		docPath.replace( '{name}', name ),
		output,
		( err ) => {
			if ( err ) {
				throw err;
			}
		}
	);
}

module.exports = buildDocsFromTests;
