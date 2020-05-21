const fs = require( 'fs' );
const path = require( 'path' );
const buildDocsFromTests = require( './build-docs-from-tests' );

const rulesData = require( './rules-data' );
const config = require( './config' );
const packagePath = require( './package-path' );
const formatter = require( './formatter' );

const loadTemplates = require( './load-templates' );
const templatePaths = [ path.join( __dirname, 'templates' ) ];
if ( config.templatePath ) {
	templatePaths.push( packagePath( config.templatePath ) );
}
const templates = loadTemplates( templatePaths );

function writeDocsFromTests( name, rule, tests ) {
	const ruleData = Object.prototype.hasOwnProperty.call( rulesData, name ) ?
		rulesData[ name ] : null;
	const outputPath = packagePath( config.docPath.replace( '{name}', name ) );
	const { output, messages } =
		buildDocsFromTests( name, rule.meta, tests, ruleData, config, templates );

	fs.writeFile(
		outputPath,
		output,
		( err ) => {
			if ( err ) {
				messages.push( { type: 'error', text: err } );
			}
			if ( messages.length ) {
				console.log( formatter.heading( outputPath ) );
				messages.forEach( ( message ) => console.log( '  ' + formatter[ message.type ]( message.text ) ) );
				console.log();
			}
		}
	);
}

module.exports = writeDocsFromTests;
