const chalk = require( 'chalk' );

function labelSuffix( label ) {
	return label ? '  ' + chalk.dim( label ) : '';
}

module.exports = {
	warn: ( msg, label ) => chalk.yellow( 'warning' ) + '  ' + msg + labelSuffix( label ),
	error: ( msg, label ) => chalk.red( 'error' ) + '  ' + msg + labelSuffix( label ),
	heading: ( msg ) => chalk.underline( msg )
};
