'use strict';

const pluralize = require( 'pluralize' );
const path = require( 'upath' );
// Mapping from extension to language name for markdown
// Default language is 'js'
const languageFromExtension = {
	'.html': 'html',
	'.ts': 'ts',
	'.vue': 'vue'
};

/**
 * Format a list of items with natural language
 *
 * Equivalent to:
 * new Intl.ListFormat( 'en', { type: 'conjunction' } );
 * However Intl.ListFormat not always available
 *
 * @param {string[]} list List of strings
 * @return {string} Concatenated list
 */
function listFormatter( list ) {
	return list.reduce( ( acc, cur, i, arr ) =>
		acc + ( i === 0 ? '' : ( ( i === arr.length - 1 ) ? ' and ' : ', ' ) ) + cur,
	'' );
}

/**
 * Make a markdown link from a target and label
 *
 * @param {string} target Link target
 * @param {string} label Link label
 * @return {string} Markdown link
 */
function mdLink( target, label ) {
	return '[' + label + '](' + target + ')';
}

function buildDocsFromTests(
	name, ruleMeta, tests, configMap, config, globalTemplates, loadRuleTemplate, testerConfig
) {

	const messages = [];
	const docs = ruleMeta.docs || {};

	/**
	 * Replace tabs with spaces.
	 *
	 * We can't reply on browsers to render tabs at at consistent width.
	 *
	 * @param {string} code
	 * @return {string}
	 */
	function fixTabs( code ) {
		return code.replace( /\t/g, ' '.repeat( config.tabWidth ) );
	}

	/**
	 * Get code from test case
	 *
	 * @param {string|Object} test Test case
	 * @return {string} Test case's code
	 */
	function getCode( test ) {
		return typeof test === 'string' ? test : test.code;
	}

	/**
	 * @param {string|Object} test Test case
	 * @return {string|null} The base file name, or null if not set
	 */
	function getFilename( test ) {
		if ( typeof test === 'string' || test.filename === undefined ) {
			// Either the test is just a code snippet, or no file name is set
			return null;
		}
		return path.basename( test.filename );
	}

	function buildRuleDetails( testList, valid, showFixes ) {
		let fixedCode, fixedOutput, maxCodeLength;
		const testsByOptions = {};

		const codeList = testList.map( getCode );
		if ( config.fixCodeExamples ) {
			const fix = require( './fix' );
			fixedCode = fix.batchLintFix( codeList, testerConfig );
		} else {
			fixedCode = codeList;
		}

		fixedCode = fixedCode.map( fixTabs );

		if ( showFixes ) {
			// Calculate maxCodeLength for alignment
			maxCodeLength = fixedCode.reduce( ( acc, code ) =>
				code.split( '\n' ).reduce(
					( lineAcc, line ) => Math.max( lineAcc, line.length ),
					acc
				),
			0 );

			const outputList = testList.map( ( test ) => test.output );
			if ( config.fixCodeExamples ) {
				const fix = require( './fix' );
				fixedOutput = fix.batchLintFix( outputList, testerConfig );
			} else {
				fixedOutput = outputList;
			}

			fixedOutput = fixedOutput.map( fixTabs );
		}

		const codeSet = {};
		let previousMultiLine = false;
		testList.forEach( function ( test, i ) {
			const docgen = test.docgen === undefined ?
				!config.excludeExamplesByDefault :
				test.docgen;

			if ( !docgen ) {
				return;
			}

			const filename = getFilename( test );
			let lang = 'js';
			// Switch to Vue if we are showing file names and its a Vue file.
			// optionsAndSettings.filename is only set if it should be shown
			// TODO should we add other languages too?
			if ( filename ) {
				const ext = path.extname( filename );
				if ( ext in languageFromExtension ) {
					lang = languageFromExtension[ ext ];
				}
			}

			// Keys are in reverse sort order, e.g. examples with options
			// are shown before examples with settings
			const optionsAndSettings = {
				// Always separate tests by language for syntax highlighting
				lang: lang,
				settings: test.settings,
				options: test.options,
				// Only group by filename if filenames are shown
				filename: config.showFilenames && filename
			};
			const hashObject = {};
			// Ensure examples without a specific key are shown first
			Object.keys( optionsAndSettings ).forEach( ( key ) => {
				hashObject[ key ] = optionsAndSettings[ key ] ?
					[ '1', optionsAndSettings[ key ] ] :
					[ '0', optionsAndSettings[ key ] ];
			} );

			const hash = JSON.stringify( hashObject );

			codeSet[ hash ] = codeSet[ hash ] || {};

			let example = '';
			let multiLine = false;
			const code = fixedCode[ i ];
			if ( !showFixes && Object.prototype.hasOwnProperty.call( codeSet[ hash ], code ) ) {
				messages.push( {
					type: 'warn',
					text: 'Duplicate code example found, examples can be hidden with `docgen: false`:\n' +
						getCode( testList[ codeSet[ hash ][ code ] ] ) + '\n' +
						getCode( testList[ i ] )
				} );
			}

			codeSet[ hash ][ code ] = i;

			testsByOptions[ hash ] = testsByOptions[ hash ] ||
				{
					tests: [],
					optionsAndSettings: optionsAndSettings
				};

			if ( showFixes && test.output ) {
				const output = fixedOutput[ i ];
				const codeLines = code.split( '\n' );
				const outputLines = output.split( '\n' );
				const maxLines = Math.max( codeLines.length, outputLines.length );
				const exampleLines = [];
				for ( let l = 0; l < maxLines; l++ ) {
					const codeLine = codeLines[ l ] || '';
					const outputLine = outputLines[ l ] || '';
					exampleLines.push(
						codeLine + ' '.repeat( Math.max( 0, maxCodeLength - codeLine.length ) ) +
						' /* → */' +
						( outputLine ? ' ' + outputLine : '' )
					);
				}
				example = exampleLines.join( '\n' );
				multiLine = maxLines > 1;
			} else {
				example = code;
				multiLine = code.split( '\n' ).length > 1;
			}
			// Put linebreaks around multi-line examples
			if ( testsByOptions[ hash ].tests.length && ( multiLine || previousMultiLine ) ) {
				example = '\n' + example;
			}
			testsByOptions[ hash ].tests.push( example );
			previousMultiLine = multiLine;
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
				comments = fix.batchLintFix( comments, testerConfig );
			}
		}

		return Object.keys( testsByOptions ).map( ( key, i ) => {
			const section = testsByOptions[ key ];
			const optionsAndSettings = section.optionsAndSettings;
			const lang = optionsAndSettings && optionsAndSettings.lang;
			const options = optionsAndSettings && optionsAndSettings.options;
			const settings = optionsAndSettings && optionsAndSettings.settings;
			const filename = optionsAndSettings && optionsAndSettings.filename;

			let examples = '```' + lang + '\n';
			if ( config.showConfigComments ) {
				examples += comments[ i ] + '\n';
			}
			examples += section.tests.join( '\n' );
			examples += '\n```';

			return {
				key: key,
				valid: valid,
				options: options ? JSON.stringify( options ) : '',
				settings: settings ? JSON.stringify( settings ) : '',
				filename: filename || '',
				examples: examples,
				testCount: section.tests.length
			};
		} );
	}

	if ( !docs.description ) {
		messages.push( { type: 'warn', text: 'No description found in rule metadata' } );
	}

	let replacedByLinks = '';
	if ( docs.deprecated && docs.replacedBy ) {
		replacedByLinks = listFormatter(
			docs.replacedBy.map( ( ruleName ) => mdLink( ruleName + '.md', '`' + ruleName + '`' ) )
		);
	}

	let inConfigs = [];
	if ( configMap ) {
		inConfigs = Array.from( configMap.keys() ).map( ( configName ) => {
			const options = configMap.get( configName );
			return {
				config: configName,
				options: options && Object.keys( options[ 0 ] ).length ? JSON.stringify( options ) : ''
			};
		} );
	}

	const invalid = buildRuleDetails( tests.invalid, false );
	const valid = buildRuleDetails( tests.valid, true );

	const validInvalid = invalid.concat( valid ).sort( ( a, b ) => {
		return a.key === b.key ?
			( a.valid < b.valid ? -1 : 1 ) :
			( a.key < b.key ? -1 : 1 );
	} );

	let fixed = [];
	if ( ruleMeta.fixable && config.showFixExamples ) {
		fixed = buildRuleDetails(
			tests.invalid.filter( ( test ) => !!test.output ),
			false,
			true
		);
	}

	const exampleCount = invalid.concat( valid ).concat( fixed )
		.reduce( ( acc, section ) => acc + section.testCount, 0 );

	if ( config.minExamples && exampleCount < config.minExamples[ 1 ] ) {
		messages.push( {
			type: config.minExamples[ 0 ],
			text: exampleCount + ' ' + pluralize( 'example', exampleCount ) + ' found, expected at least ' + config.minExamples[ 1 ] + '.',
			label: 'config.minExamples'
		} );
	}
	if ( config.maxExamples && exampleCount > config.maxExamples[ 1 ] ) {
		messages.push( {
			type: config.maxExamples[ 0 ],
			text: exampleCount + ' ' + pluralize( 'example', exampleCount ) + ' found, expected fewer than ' + config.maxExamples[ 1 ] + '.',
			label: 'config.maxExamples'
		} );
	}

	/**
	 * Code path with substituted rule name
	 *
	 * @param {string} pattern Code path with {name} as placeholder for the rule name
	 * @param {string} ruleName Rule name
	 * @return {string}
	 */
	function codeLink( pattern, ruleName ) {
		const filePath = pattern.replace( '{name}', ruleName );
		return path.join( '/', filePath );
	}

	let output;
	let index = globalTemplates.index;

	if ( config.ruleTemplatePath ) {
		const fs = require( 'fs' );
		const packagePath = require( './package-path' );
		const ruleTemplatePath = packagePath( config.ruleTemplatePath.replace( '{name}', name ) );
		if ( fs.existsSync( ruleTemplatePath ) ) {
			index = loadRuleTemplate( ruleTemplatePath );
		}
	}

	try {
		output = index( {
			// root
			description: docs.description,
			title: name,
			// deprecated
			deprecated: docs.deprecated,
			replacedByLinks: replacedByLinks,
			// inConfigs
			inConfigs: inConfigs,
			pluginName: config.pluginName,
			// fixable
			fixable: !!ruleMeta.fixable,
			// examples
			fixed: fixed,
			validInvalid: validInvalid,
			invalid: invalid,
			valid: valid,
			// resources
			linkDoc: config.docLink ? codeLink( config.docPath, name ) : '',
			linkRule: config.ruleLink ? codeLink( config.rulePath, name ) : '',
			linkTest: config.testLink ? codeLink( config.testPath, name ) : ''
		} ).replace( /\n{3,}/g, '\n\n' ).trim() + '\n';
	} catch ( e ) {
		// TODO: Test template errors
		// istanbul ignore next
		messages.push( { type: 'error', text: e } );
	}

	return {
		output: output,
		messages: messages
	};
}

module.exports = buildDocsFromTests;
