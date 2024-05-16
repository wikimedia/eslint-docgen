'use strict';

const packagePath = require( './package-path' );
// eslint-disable-next-line security/detect-non-literal-require
const main = require( packagePath( './package' ) ).main || 'index.js';

module.exports = packagePath( main );
