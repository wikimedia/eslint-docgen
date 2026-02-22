#!/usr/bin/env node
'use strict';

const fs = require( 'fs' );
const rulesWithConfig = require( './rules-with-config' );
const getConfig = require( './get-config' );
const ruleRename = ( name ) => name.replace( 'deprecated-', '' );

const config = getConfig();

const template = fs.readFileSync( config.readmeTemplate, { encoding: 'UTF8' } );

function getRules( deprecated ) {
	return Array.from( rulesWithConfig.keys() ).map( ( rule ) => {
		const fullRule = config.pluginName + '/' + rule;
		const ruleData = rulesWithConfig.get( rule );
		const docs = ruleData.meta.docs;
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
						Array.from( ruleData.configMap.keys() ).map( ( name ) => {
							const options = ruleData.configMap.get( name );
							// TODO: Create util to compare options to defaults
							return '`' + ruleRename( name ) + ( ( options && Object.keys( options[ 0 ] ).length ) ? '†' : '' ) + '`';
						} ).join( ', ' ) :
						''
				);
		}
		return null;
	} ).filter( ( rule ) => rule ).join( '\n' );
}

fs.writeFile(
	config.readmeTarget,
	`<!-- This file is built by eslint-docgen-build-readme. Do not edit it directly; edit ${ config.readmeTemplate } instead. -->\n` +
	template
		.replace( '<!-- rules -->', getRules( false ) )
		.replace( '<!-- deprecated -->', getRules( true ) ),
	( err ) => {
		if ( err ) {
			throw err;
		}
	}
);
