const ejs = require( 'ejs' );
const path = require( 'path' );
const fs = require( 'fs' );

const rulesData = require( './rules-data' );

const config = require( './config' );

const loadTemplates = require( './load-templates' );
const templates = loadTemplates( path.join( __dirname, 'templates' ) );

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
	let
		deprecated = '',
		description = '',
		fixable = '',
		inConfig = '',
		resources = '';

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
		inConfig = rulesData[ name ].map( ( data ) => {
			const configDesc = '`plugin:' + config.pluginName + '/' + data.ruleset + '`' +
				// TODO: Create util to compare options to defaults
				( data.options && Object.keys( data.options[ 0 ] ).length ?
					' with `' + JSON.stringify( data.options ) + '` options' :
					'' );
			return ejs.render( templates.inConfig, { configDesc: configDesc } );
		} ).join( '\n\n' );
	}

	const invalid = buildRuleDetails( tests.invalid, '❌' );

	const valid = buildRuleDetails( tests.valid, '✔️' );

	if ( rule.meta.fixable ) {
		const fixes = buildRuleDetails( tests.invalid.filter( ( test ) => !!test.output ), '🔧', true );
		fixable = ejs.render( templates.fixable, { fixes: fixes } );
	}

	function codeLink( pattern, name ) {
		const filePath = config.rulePath.replace( '{name}', name );
		return path.join( '/', filePath );
	}

	if ( config.docLink || config.ruleLink || config.testLink ) {
		resources = ejs.render( templates.resources, {
			docLink: config.docLink ?
				ejs.render( templates.docLink, { link: codeLink( config.docPath, name ) } ) : '',
			ruleLink: config.ruleLink ?
				ejs.render( templates.ruleLink, { link: codeLink( config.rulePath, name ) } ) : '',
			testLink: config.testLink ?
				ejs.render( templates.testLink, { link: codeLink( config.testPath, name ) } ) : ''
		} );
	}

	const sourceLink = mdLink( '/' + path, path );

	const output = ejs.render( templates.index, {
		deprecated: deprecated,
		description: description,
		fixable: fixable,
		inConfig: inConfig,
		invalid: invalid,
		resources: resources,
		sourceLink: sourceLink,
		title: name,
		valid: valid
	} ).replace( /\n{3,}/g, '\n\n' ).trim() + '\n';

	fs.writeFile(
		config.docPath.replace( '{name}', name ),
		output,
		( err ) => {
			if ( err ) {
				throw err;
			}
		}
	);
}

module.exports = buildDocsFromTests;
