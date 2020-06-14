'use strict';

const Validator = require( 'jsonschema' ).Validator;
const v = new Validator();
const schema = require( './config-schema' );

/**
 * Validate a config against the schema
 *
 * @param {Object} config Config
 * @return {string[]} A list of errors found
 */
function validateConfig( config ) {
	const errors = v.validate( config, schema ).errors.map( ( e ) =>
		e.schema.message ? e.property + ' ' + e.schema.message : e.stack );

	return errors;
}

module.exports = validateConfig;
