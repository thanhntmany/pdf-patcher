'use strict';
const zlib = require( 'zlib' );


exports.decode = function(stream, DecodeParm, root) {
    return zlib.unzipSync(stream);
};

exports.encode = function() {
    // #TODO:
};