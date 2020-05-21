const chalk = require( 'chalk' );

module.exports = {
	warning: ( msg ) => chalk.yellow( 'warning' ) + ' ' + msg,
	error: ( msg ) => chalk.red( 'error' ) + ' ' + msg,
	heading: ( msg ) => chalk.underline( msg )
};
