'use strict';

/* eslint-disable no-process-exit */
const fs = require( 'fs' );
const mkdirp = require( 'mkdirp' );
const path = require( 'upath' );
const buildDocsFromTests = require( './build-docs-from-tests' );

const formatter = require( './formatter' );
const rulesWithConfig = require( './rules-with-config' );

const getConfig = require( './get-config' );
let config, configPath;
try {
	( { config, configPath } = getConfig() );
} catch ( e ) {
	console.log( formatter.heading( 'eslint-docgen' ) );
	console.log( formatter.error( e.message ) );
	console.log();
	process.exit( 1 );
}

const configValidator = require( './validate-config' );
function assertValidConfig( maybeValidConfig, configSource ) {
	const configErrors = configValidator( maybeValidConfig );
	if ( configErrors.length ) {
		console.log( formatter.heading( configSource ) );
		configErrors.forEach( ( error ) => console.log( formatter.error( error ) ) );
		console.log();
		process.exit( 1 );
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
		console.log();
		console.log( formatter.heading( outputPath ) );
		console.log( formatter.error( 'Rule not found.' ) );
		console.log();
		process.exit( 1 );
	}
	const configMap = rulesWithConfig.get( name ).configMap;
	let output, messages;
	try {
		( { output, messages } = await buildDocsFromTests(
			name, rule.meta, tests, configMap, configForRule,
			globalTemplates, loadRuleTemplate, testerConfig
		) );
	} catch ( e ) {
		console.log();
		console.log( formatter.heading( outputPath ) );
		console.log( formatter.error( e.message ) );
		console.log();
		process.exit( 1 );
	}

	const outputDir = path.dirname( outputPath );
	mkdirp( outputDir ).then( () => {
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
					messages.forEach( ( message ) =>
						console.log( formatter[ message.type ]( message.text, message.label ) )
					);
					console.log();
				}

				if ( messages.some( ( message ) => message.type === 'error' ) ) {
					process.exit( 1 );
				}

				done();
			}
		);
	} );
}

module.exports = writeDocsFromTests;
