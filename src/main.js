const packagePath = require( './package-path' );
const main = require( packagePath( './package' ) ).main;

module.exports = packagePath( main );
