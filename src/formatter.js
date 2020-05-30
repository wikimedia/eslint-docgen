'use strict';

const chalk = require( 'chalk' );

function labelSuffix( label ) {
	return label ? '  ' + chalk.dim( label ) : '';
}

function indentAfterFirst( text, indent ) {
	return text.split( '\n' ).map( ( line, i ) =>
		i ? ' '.repeat( indent ) + line : line
	).join( '\n' );
}

module.exports = {
	warn: ( msg, label ) => '  ' + chalk.yellow( 'warning' ) + '  ' + indentAfterFirst( msg, 11 ) + labelSuffix( label ),
	error: ( msg, label ) => '  ' + chalk.red( 'error' ) + '  ' + indentAfterFirst( msg, 9 ) + labelSuffix( label ),
	heading: ( msg ) => chalk.underline( msg )
};
