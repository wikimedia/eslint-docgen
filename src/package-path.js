'use strict';

const pkgDir = require( 'pkg-dir' );
const path = require( 'upath' );
const dir = pkgDir.sync();

function packagePath( p ) {
	return path.join( dir, p );
}

module.exports = packagePath;
