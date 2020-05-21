function validateConfig( config ) {
	const errors = [];
	// Validation
	if ( config.ruleLink && !config.rulePath ) {
		errors.push( 'rulePath must be set when ruleLink is true' );
	}
	if ( config.testLink && !config.testPath ) {
		errors.push( 'testPath must be set when testLink is true' );
	}
	return errors;
}

module.exports = validateConfig;
