'use strict';

/* eslint-disable no-process-exit */
const fs = require( 'fs' );
const path = require( 'path' );
const buildDocsFromTests = require( './build-docs-from-tests' );

const formatter = require( './formatter' );
const rulesData = require( './rules-data' );

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

const configErrors = require( './validate-config' )( config );

if ( configErrors.length ) {
	console.log( formatter.heading( configPath ) );
	configErrors.forEach( ( error ) => console.log( formatter.error( error ) ) );
	console.log();
	process.exit( 1 );
}

const packagePath = require( './package-path' );

const loadTemplates = require( './load-templates' );
const templatePaths = [ path.join( __dirname, 'templates' ) ];
if ( config.globalTemplatePath ) {
	templatePaths.push( packagePath( config.globalTemplatePath ) );
}
const { globalTemplates, loadRuleTemplate } = loadTemplates( templatePaths );

function writeDocsFromTests( name, rule, tests, testerConfig ) {
	const fullName = config.pluginName + '/' + name;
	const ruleData = Object.prototype.hasOwnProperty.call( rulesData, fullName ) ?
		rulesData[ fullName ] : null;
	const outputPath = packagePath( config.docPath.replace( '{name}', name ) );
	let output, messages;
	try {
		( { output, messages } = buildDocsFromTests(
			name, rule.meta, tests, ruleData, config,
			globalTemplates, loadRuleTemplate, testerConfig
		) );
	} catch ( e ) {
		console.log( formatter.heading( outputPath ) );
		console.log( formatter.error( e.message ) );
		console.log();
		process.exit( 1 );
	}

	fs.writeFile(
		outputPath,
		output,
		( err ) => {
			if ( err ) {
				messages.push( { type: 'error', text: err } );
			}
			if ( messages.length ) {
				console.log( formatter.heading( outputPath ) );
				messages.forEach( ( message ) =>
					console.log( formatter[ message.type ]( message.text, message.label ) )
				);
				console.log();
			}

			if ( messages.some( ( message ) => message.type === 'error' ) ) {
				process.exit( 1 );
			}
		}
	);
}

module.exports = writeDocsFromTests;
