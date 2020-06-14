'use strict';

const packagePath = require( './package-path' );
const main = require( packagePath( './package' ) ).main || 'index.js';

module.exports = packagePath( main );
