const ejs = require( 'ejs' );
const path = require( 'path' );

function mdLink( target, label ) {
	return '[' + label + '](' + target + ')';
}

function buildDocsFromTests( name, ruleMeta, tests, ruleData, config, templates ) {
	let
		deprecated = '',
		description = '',
		fixable = '',
		inConfig = '',
		resources = '';

	function buildRuleDetails( testList, icon, showFixes ) {
		let fixedCode, fixedOutput, maxCodeLength;
		const testsByOptions = {};

		const codeList = testList.map( ( test ) => typeof test === 'string' ? test : test.code );
		if ( config.fixCodeExamples ) {
			const fix = require( './fix' );
			fixedCode = fix.batchLintFix( codeList );

		} else {
			fixedCode = codeList;
		}

		if ( showFixes ) {
			// Calculate maxCodeLength for alignment
			maxCodeLength = fixedCode.reduce( function ( acc, code ) {
				return Math.max( acc, code.length );
			}, 0 );

			const outputList = testList.map( ( test ) => test.output || 'null' );
			if ( config.fixCodeExamples ) {
				const fix = require( './fix' );
				fixedOutput = fix.batchLintFix( outputList );
			} else {
				fixedOutput = outputList;
			}
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

		let comments = {};
		if ( config.showConfigComments ) {
			comments = Object.keys( testsByOptions ).map( ( key ) => {
				const optionsAndSettings = testsByOptions[ key ].optionsAndSettings;
				const value = optionsAndSettings && optionsAndSettings.options ?
					[ 'error', optionsAndSettings.options ] :
					'error';
				return '/*eslint ' + config.pluginName + '/' + name + ': ' + JSON.stringify( value ) + '*/';
			} );
			if ( config.fixCodeExamples ) {
				const fix = require( './fix' );
				// Fixes whitespace in block comment. Too expensive for such a small fix?
				comments = fix.batchLintFix( comments );
			}
		}

		return Object.keys( testsByOptions ).map( ( key, i ) => {
			let output = '';
			const section = testsByOptions[ key ];
			const optionsAndSettings = section.optionsAndSettings;
			if ( optionsAndSettings ) {
				output += ( icon ? icon + ' ' : '' ) + 'With';
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
			if ( config.showConfigComments ) {
				output += comments[ i ] + '\n';
			}
			output += section.tests.join( '\n' );
			output += '\n```';

			return output;
		} ).join( '\n\n' );
	}
	const docs = ruleMeta.docs || {};

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

	if ( ruleData ) {
		inConfig = ruleData.map( ( data ) => {
			const configDesc = '`plugin:' + config.pluginName + '/' + data.ruleset + '`' +
				// TODO: Create util to compare options to defaults
				( data.options && Object.keys( data.options[ 0 ] ).length ?
					' with `' + JSON.stringify( data.options ) + '` options' :
					'' );
			return ejs.render( templates.inConfig, { configDesc: configDesc } );
		} ).join( '\n\n' );
	}

	const invalid = buildRuleDetails( tests.invalid, templates.iconInvalid );

	const valid = buildRuleDetails( tests.valid, templates.iconValid );

	if ( ruleMeta.fixable ) {
		const fixes = buildRuleDetails(
			tests.invalid.filter( ( test ) => !!test.output ),
			templates.iconFix,
			true
		);
		fixable = ejs.render( templates.fixable, {
			icon: templates.iconFix ? templates.iconFix + ' ' : '',
			fixes: fixes
		} );
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

	return ejs.render( templates.index, {
		deprecated: deprecated,
		description: description,
		fixable: fixable,
		iconValid: templates.iconValid ? templates.iconValid + ' ' : '',
		iconInvalid: templates.iconInvalid ? templates.iconInvalid + ' ' : '',
		inConfig: inConfig,
		invalid: invalid,
		resources: resources,
		sourceLink: sourceLink,
		title: name,
		valid: valid
	} ).replace( /\n{3,}/g, '\n\n' ).trim() + '\n';
}

module.exports = buildDocsFromTests;
