const fs = require( 'fs' );
const path = require( 'path' );
const buildDocsFromTests = require( './build-docs-from-tests' );

const rulesData = require( './rules-data' );
const config = require( './config' );

const loadTemplates = require( './load-templates' );
const templates = loadTemplates( path.join( __dirname, 'templates' ) );

if ( config.templatePath ) {
	const packagePath = require( './package-path' );
	const packageTemplates = loadTemplates( packagePath( config.templatePath ) );
	Object.assign( templates, packageTemplates );
}

function writeDocsFromTests( name, rule, tests ) {
	const ruleData = Object.prototype.hasOwnProperty.call( rulesData, name ) ?
		rulesData[ name ] : null;
	const output = buildDocsFromTests( name, rule.meta, tests, ruleData, config, templates );

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

module.exports = writeDocsFromTests;
