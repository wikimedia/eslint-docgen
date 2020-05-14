const ejs = require( 'ejs' );
const path = require( 'path' );
const fs = require( 'fs' );
const rulePath = 'src/rules/{name}.js';
const docPath = 'docs/{name}.md';

const rulesData = require( './rules-data' );

const packagePath = require( './package-path' );
const pluginName = require( packagePath( './package' ) ).name.replace( 'eslint-plugin-', '' );

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
	const batchLintFix = require( './fix' ).batchLintFix;
	const testsByOptions = {};
	let output = '';
	let maxCodeLength;

	const fixedCode = batchLintFix( tests.map( ( test ) => typeof test === 'string' ? test : test.code ) );

	let fixedOutput;
	if ( showFixes ) {
		maxCodeLength = fixedCode.reduce( function ( acc, code ) {
			return Math.max( acc, code.length );
		}, 0 );
		fixedOutput = batchLintFix( tests.map( ( test ) => test.output || 'null' ) );
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
