'use strict';

const packagePath = require( './package-path' );
// eslint-disable-next-line security/detect-non-literal-require
const packageName = require( packagePath( './package' ) ).name;
const naming = require( './naming' );
const pluginName = naming.getShorthandName( packageName, 'eslint-plugin' );

module.exports = {
	pluginName: pluginName,
	fixCodeExamples: true,
	showConfigComments: false,
	showFilenames: false,
	showFixExamples: true,
	tabWidth: 4,
	docPath: null,
	rulePath: null,
	testPath: null,
	ruleTemplatePath: null,
	globalTemplatePath: null,
	docLink: false,
	ruleLink: true,
	testLink: true,
	excludeExamplesByDefault: false,
	minExamples: [ 'warn', 2 ],
	maxExamples: [ 'warn', 50 ]
};
