#!/usr/bin/env node
'use strict';

const configRename = ( name ) => name.replace( 'deprecated-', '' );

/**
 * Build the README contents from a template
 *
 * @param {Object} config Resolved eslint-docgen config
 * @param {Map} rulesWithConfig Map of rule names to rule data (meta and configMap)
 * @param {string} template README template containing `<!-- rules -->` and
 *  `<!-- deprecated -->` placeholders
 * @return {string} README contents
 */
function buildReadme( config, rulesWithConfig, template ) {
	function getRules( deprecated ) {
		return Array.from( rulesWithConfig.keys() ).map( ( rule ) => {
			const fullRule = config.pluginName + '/' + rule;
			const ruleData = rulesWithConfig.get( rule );
			const docs = ruleData.meta.docs;
			const configs = Array.from( ruleData.configMap.keys() ).map( ( name ) => {
				const { options, severity } = ruleData.configMap.get( name );
				// TODO: Create util to compare options to defaults
				return {
					name: configRename( name ),
					hasOptions: !!( options && Object.keys( options[ 0 ] ).length ),
					severity
				};
			} );
			// Sort configs by name - sort numerical values by version number
			configs.sort( ( a, b ) => {
				if ( a.name.includes( '.' ) === -1 ) {
					return a.name.localeCompare( b.name );
				}
				const aVersion = a.name.split( '.' ).map( ( n ) => parseInt( n, 10 ) );
				const bVersion = b.name.split( '.' ).map( ( n ) => parseInt( n, 10 ) );
				for ( let i = 0; i < Math.max( aVersion.length, bVersion.length ); i++ ) {
					if ( aVersion[ i ] !== bVersion[ i ] ) {
						return ( aVersion[ i ] || 0 ) - ( bVersion[ i ] || 0 );
					}
				}
				return 0;
			} );
			if ( !!docs.deprecated === deprecated ) {
				return '* [`' + fullRule + '`](' + config.docPath.replace( '{name}', rule ) + ')' +
					(
						ruleData.meta.schema.length ?
							' ⚙️' :
							''
					) +
					(
						ruleData.meta.fixable ?
							' 🔧' :
							''
					) +
					(
						docs.replacedBy ?
							' (use [`' + config.pluginName + '/' + docs.replacedBy + '`](' + config.docPath.replace( '{name}', docs.replacedBy ) + '))' :
							''
					) +
					(
						ruleData.configMap.size ?
							' ' +
							Array.from( configs ).map(
								( c ) => ( c.severity === 'error' ? '**' : '' ) +
									'`' + c.name + ( c.hasOptions ? '†' : '' ) + '`' +
									( c.severity === 'error' ? '**' : '' ) ).join( ', ' ) :
							''
					);
			}
			return null;
		} ).filter( ( rule ) => rule ).join( '\n' );
	}

	return `<!-- This file is built by eslint-docgen-build-readme. Do not edit it directly; edit ${ config.readmeTemplate } instead. -->\n` +
		template
			.replace( '<!-- rules -->', getRules( false ) )
			.replace( '<!-- deprecated -->', getRules( true ) );
}

/* istanbul ignore next */
function main() {
	const fs = require( 'fs' );
	const rulesWithConfig = require( './rules-with-config' );
	const getConfig = require( './get-config' );

	const config = getConfig();
	// eslint-disable-next-line security/detect-non-literal-fs-filename
	const template = fs.readFileSync( config.readmeTemplate, { encoding: 'UTF8' } );

	// eslint-disable-next-line security/detect-non-literal-fs-filename
	fs.writeFile(
		config.readmeTarget,
		buildReadme( config, rulesWithConfig, template ),
		( err ) => {
			if ( err ) {
				throw err;
			}
		}
	);
}

/* istanbul ignore next */
if ( require.main === module ) {
	main();
}

module.exports = buildReadme;
