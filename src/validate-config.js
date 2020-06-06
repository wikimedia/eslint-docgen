'use strict';

const Validator = require( 'jsonschema' ).Validator;
const v = new Validator();
const schema = require( './config-schema' );

function validateConfig( config ) {
	const errors = v.validate( config, schema ).errors.map( ( e ) => e.stack );
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
