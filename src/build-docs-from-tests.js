const path = require( 'path' );

function mdLink( target, label ) {
	return '[' + label + '](' + target + ')';
}

function buildDocsFromTests( name, ruleMeta, tests, ruleData, config, templates ) {
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

	function buildRuleDetails( testList, showFixes ) {
		let fixedCode, fixedOutput, maxCodeLength;
		const testsByOptions = {};

		const codeList = testList.map( ( test ) => typeof test === 'string' ? test : test.code );
		if ( config.fixCodeExamples ) {
			const fix = require( './fix' );
			fixedCode = fix.batchLintFix( codeList );
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

			const outputList = testList.map( ( test ) => test.output || 'null' );
			if ( config.fixCodeExamples ) {
				const fix = require( './fix' );
				fixedOutput = fix.batchLintFix( outputList );
			} else {
				fixedOutput = outputList;
			}

			fixedOutput = fixedOutput.map( fixTabs );
		}

		let previousMultiLine = false;
		testList.forEach( function ( test, i ) {
			let example = '';
			let multiLine = false;
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
				const output = fixedOutput[ i ];
				const codeLines = code.split( '\n' );
				const outputLines = output.split( '\n' );
				const maxLines = Math.max( codeLines.length, outputLines.length );
				const exampleLines = [];
				for ( let i = 0; i < maxLines; i++ ) {
					const code = codeLines[ i ] || '';
					const output = outputLines[ i ] || '';
					exampleLines.push(
						code + ' '.repeat( Math.max( 0, maxCodeLength - code.length ) ) +
						' /* → */' +
						( output ? ' ' + output : '' )
					);
				}
				example = exampleLines.join( '\n' );
				multiLine = maxLines > 1;
			} else {
				example = code;
				multiLine = code.split( '\n' ).length > 1;
			}
			if ( multiLine || previousMultiLine ) {
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
				comments = fix.batchLintFix( comments );
			}
		}

		return Object.keys( testsByOptions ).map( ( key, i ) => {
			const section = testsByOptions[ key ];
			const optionsAndSettings = section.optionsAndSettings;
			const options = optionsAndSettings && optionsAndSettings.options;
			const settings = optionsAndSettings && optionsAndSettings.settings;

			let examples = '```js\n';
			if ( config.showConfigComments ) {
				examples += comments[ i ] + '\n';
			}
			examples += section.tests.join( '\n' );
			examples += '\n```';

			return {
				options: options ? JSON.stringify( options ) : '',
				settings: settings ? JSON.stringify( settings ) : '',
				examples: examples
			};
		} );
	}

	const docs = ruleMeta.docs || {};

	if ( !docs.description ) {
		console.warn( 'Rule `' + name + '` has no description.' );
	}

	let replacedByLinks = '';
	if ( docs.deprecated && docs.replacedBy ) {
		replacedByLinks = docs.replacedBy.map( ( name ) => mdLink( name + '.md', '`' + name + '`' ) ).join( ', ' );
	}

	let inConfigs = [];
	if ( ruleData ) {
		inConfigs = ruleData.map( ( data ) => ( {
			config: data.config,
			options: data.options && Object.keys( data.options[ 0 ] ).length ? JSON.stringify( data.options ) : ''
		} ) );
	}

	const invalid = buildRuleDetails( tests.invalid );

	const valid = buildRuleDetails( tests.valid );

	let fixed = [];
	if ( ruleMeta.fixable ) {
		fixed = buildRuleDetails(
			tests.invalid.filter( ( test ) => !!test.output ),
			true
		);
	}

	function codeLink( pattern, name ) {
		const filePath = pattern.replace( '{name}', name );
		return path.join( '/', filePath );
	}

	return templates.index( {
		// root
		description: docs.description,
		title: name,
		// deprecated
		deprecated: docs.deprecated,
		replacedByLinks: replacedByLinks,
		// inConfigs
		inConfigs: inConfigs,
		pluginName: config.pluginName,
		// examples
		fixed: fixed,
		invalid: invalid,
		valid: valid,
		// resources
		linkDoc: config.docLink ? codeLink( config.docPath, name ) : '',
		linkRule: config.ruleLink ? codeLink( config.rulePath, name ) : '',
		linkTest: config.testLink ? codeLink( config.testPath, name ) : ''
	} ).replace( /\n{3,}/g, '\n\n' ).trim() + '\n';
}

module.exports = buildDocsFromTests;
