'use strict';

const chalk = require( 'chalk' );

/**
 * Add a dim "label" suffix
 *
 * @param {string} label Label
 * @return {string}
 */
function labelSuffix( label ) {
	return label ? '  ' + chalk.dim( label ) : '';
}

/**
 * Indent every line except the first one by a fixed amount
 *
 * @param {string} text Text to indent
 * @param {number} indent Characters to indent by
 * @return {string}
 */
function indentAfterFirst( text, indent ) {
	return text.split( '\n' ).map( ( line, i ) =>
		i ? ' '.repeat( indent ) + line : line
	).join( '\n' );
}

module.exports = {
	/**
	 * Format a message as a warning
	 *
	 * @param {string} msg Message
	 * @param {string} label Label suffix
	 * @return {string}
	 */
	warn: ( msg, label ) => '  ' + chalk.yellow( 'warning' ) + '  ' + indentAfterFirst( msg, 11 ) + labelSuffix( label ),
	/**
	 * Format a message as an error
	 *
	 * @param {string} msg Message
	 * @param {string} label Label suffix
	 * @return {string}
	 */
	error: ( msg, label ) => '  ' + chalk.red( 'error' ) + '  ' + indentAfterFirst( msg, 9 ) + labelSuffix( label ),
	/**
	 * Format a message as a heading
	 *
	 * @param {string} msg Message
	 * @return {string}
	 */
	heading: ( msg ) => chalk.underline( msg )
};
