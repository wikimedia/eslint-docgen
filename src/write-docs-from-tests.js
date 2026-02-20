'use strict';

const fs = require( 'fs' );
const { mkdirp } = require( 'mkdirp' );
const path = require( 'upath' );
const buildDocsFromTests = require( './build-docs-from-tests' );

const formatter = require( './formatter' );
const rulesWithConfig = require( './rules-with-config' );

const getConfig = require( './get-config' );
let config, configPath;
try {
	( { config, configPath } = getConfig() );
} catch ( e ) {
	throw new Error( [ formatter.heading( 'eslint-docgen' ), formatter.error( e.message ) ].join( '\n' ) );
}

const configValidator = require( './validate-config' );
function assertValidConfig( maybeValidConfig, configSource ) {
	const configErrors = configValidator( maybeValidConfig );
	if ( configErrors.length ) {
		throw new Error( [ formatter.heading( configSource ), ...configErrors.map( formatter.error ) ].join( '\n' ) );
	}
}

assertValidConfig( config, configPath );

const packagePath = require( './package-path' );

const loadTemplates = require( './load-templates' );
const templatePaths = [ path.join( __dirname, 'templates' ) ];
if ( config.globalTemplatePath ) {
	templatePaths.push( packagePath( config.globalTemplatePath ) );
}
const { globalTemplates, loadRuleTemplate } = loadTemplates( templatePaths );

async function writeDocsFromTests( name, rule, tests, testerConfig, done ) {
	// If the tests have a `docgenConfig` property, this overrides the global configuration
	let configForRule = config;
	if ( tests.docgenConfig !== undefined ) {
		configForRule = Object.assign( {}, config, tests.docgenConfig );
		assertValidConfig( configForRule, 'Rule specific config for ' + name );
		delete tests.docgenConfig;
	}
	const outputPath = packagePath( configForRule.docPath.replace( '{name}', name ) );
	const ruleWithConfig = rulesWithConfig.get( name );
	if ( !ruleWithConfig ) {
		throw new Error( [ formatter.heading( outputPath ), formatter.error( 'Rule not found.' ) ].join( '\n' ) );
	}
	const configMap = rulesWithConfig.get( name ).configMap;
	let output, messages;
	try {
		( { output, messages } = await buildDocsFromTests(
			name, rule.meta, tests, configMap, configForRule,
			globalTemplates, loadRuleTemplate, testerConfig
		) );
	} catch ( e ) {
		throw new Error( [ formatter.heading( outputPath ), formatter.error( e.message ) ].join( '\n' ) );
	}

	const outputDir = path.dirname( outputPath );
	mkdirp( outputDir ).then( () => {
		// eslint-disable-next-line security/detect-non-literal-fs-filename
		fs.writeFile(
			outputPath,
			output,
			( err ) => {
				if ( err ) {
					messages.push( { type: 'error', text: err.toString() } );
				}
				if ( messages.length ) {
					console.log();
					console.log( formatter.heading( outputPath ) );
					messages.forEach(
						( message ) => console.log( formatter[ message.type ]( message.text, message.label ) )
					);
					console.log();
				}

				const errors = messages.filter( ( message ) => message.type === 'error' );

				if ( errors.length ) {
					throw new Error( errors.map( formatter.error ).join( '\n' ) );
				}

				done();
			}
		);
	} );
}

module.exports = writeDocsFromTests;
