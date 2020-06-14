'use strict';

// istanbul ignore file
// Method is tested upstream

/**
 * Removes the prefix from a fullname.
 *
 * Copied from https://github.com/eslint/eslint/blob/master/lib/shared/naming.js
 *
 * @param {string} fullname The term which may have the prefix.
 * @param {string} prefix The prefix to remove.
 * @return {string} The term without prefix.
 */
function getShorthandName( fullname, prefix ) {
	if ( fullname[ 0 ] === '@' ) {
		let matchResult = new RegExp( `^(@[^/]+)/${prefix}$`, 'u' ).exec( fullname );

		if ( matchResult ) {
			return matchResult[ 1 ];
		}

		matchResult = new RegExp( `^(@[^/]+)/${prefix}-(.+)$`, 'u' ).exec( fullname );
		if ( matchResult ) {
			return `${matchResult[ 1 ]}/${matchResult[ 2 ]}`;
		}
	} else if ( fullname.startsWith( `${prefix}-` ) ) {
		return fullname.slice( prefix.length + 1 );
	}

	return fullname;
}

module.exports = {
	getShorthandName: getShorthandName
};
