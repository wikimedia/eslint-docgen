const ejs = require( 'ejs' );
const path = require( 'path' );
const fs = require( 'fs' );

const rulesData = require( './rules-data' );

const config = require( './config' );

const loadTemplates = require( './load-templates' );
const templates = loadTemplates( path.join( __dirname, 'templates' ) );

if ( config.templatePath ) {
	const packagePath = require( './package-path' );
	const packageTemplates = loadTemplates( packagePath( config.templatePath ) );
	Object.assign( templates, packageTemplates );
}

function mdLink( target, label ) {
	return '[' + label + '](' + target + ')';
}

function buildDocsFromTests( name, rule, tests ) {
	let
		deprecated = '',
		description = '',
		fixable = '',
		inConfig = '',
		resources = '';

	function buildRuleDetails( testList, icon, showFixes ) {
		const fix = require( './fix' );
		const testsByOptions = {};
		let output = '';
		let maxCodeLength;

		const fixedCode = fix.batchLintFix( testList.map( ( test ) => typeof test === 'string' ? test : test.code ) );

		let fixedOutput;
		if ( showFixes ) {
			maxCodeLength = fixedCode.reduce( function ( acc, code ) {
				return Math.max( acc, code.length );
			}, 0 );
			fixedOutput = fix.batchLintFix( testList.map( ( test ) => test.output || 'null' ) );
		}

		testList.forEach( function ( test, i ) {
			let optionsAndSettings = null;
			const code = fixedCode[ i ];

			if ( test.noDoc ) {
				return;
			}
			if ( test.options || test.settings ) {
				optionsAndSettings = {
					options: test.options,
					settings: test.settings
				};
			}
			const hash = JSON.stringify( optionsAndSettings );
			testsByOptions[ hash ] = testsByOptions[ hash ] ||
				{
					tests: [],
					optionsAndSettings: optionsAndSettings
				};
			if ( showFixes && test.output ) {
				testsByOptions[ hash ].tests.push(
					code + ' '.repeat( Math.max( 0, maxCodeLength - code.length ) ) +
					' /* → */ ' +
					fixedOutput[ i ]
				);
			} else {
				testsByOptions[ hash ].tests.push( code );
			}
		} );

		let directives = {};
		if ( config.showDirectiveInExamples ) {
			directives = Object.keys( testsByOptions ).map( ( key ) => {
				const optionsAndSettings = testsByOptions[ key ].optionsAndSettings;
				const value = optionsAndSettings && optionsAndSettings.options ?
					[ 'error', optionsAndSettings.options ] :
					'error';
				return '/*eslint ' + config.pluginName + '/' + name + ': ' + JSON.stringify( value ) + '*/';
			} );
			// Fixes whitespace in block comment. Too expensive for such a small fix?
			directives = fix.batchLintFix( directives );
		}

		Object.keys( testsByOptions ).forEach( ( key, i ) => {
			const section = testsByOptions[ key ];
			const optionsAndSettings = section.optionsAndSettings;
			if ( optionsAndSettings ) {
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
			if ( config.showDirectiveInExamples ) {
				output += directives[ i ] + '\n';
			}
			output += section.tests.join( '\n' );
			output += '\n```\n';
		} );

		return output;
	}
	const docs = rule.meta.docs || {};

	if ( docs.description ) {
		description = docs.description;
	} else {
		console.warn( 'Rule ' + name + ' has no description.' );
	}

	if ( docs.deprecated ) {
		let replacedBy = '';
		if ( docs.replacedBy ) {
			const ruleLinks = docs.replacedBy.map( ( name ) => mdLink( name + '.md', '`' + name + '`' ) ).join( ', ' );
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
		const filePath = pattern.replace( '{name}', name );
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
