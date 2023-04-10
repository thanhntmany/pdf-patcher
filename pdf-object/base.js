'use strict';
const { Buffer } = require('buffer');


const BASE_ENCODE = 'ascii';
Object.assign(exports, {
    BASE_ENCODE: BASE_ENCODE,

    ASCII_NULL: 0,
    ASCII_HT: 9,
    ASCII_LF: 10,
    ASCII_FF: 12,
    ASCII_CR: 13,
    ASCII_BS: 8,
    ASCII_SPACE: 32,

    ASCII_n: Buffer.from('n', BASE_ENCODE)[0],
    ASCII_r: Buffer.from('r', BASE_ENCODE)[0],
    ASCII_t: Buffer.from('t', BASE_ENCODE)[0],
    ASCII_b: Buffer.from('b', BASE_ENCODE)[0],
    ASCII_f: Buffer.from('f', BASE_ENCODE)[0],
    ASCII_R: Buffer.from('R', BASE_ENCODE)[0],

    LEFT_PARENTHESIS: Buffer.from('(', BASE_ENCODE)[0],
    RIGHT_PARENTHESIS: Buffer.from(')', BASE_ENCODE)[0],
    LESS_THAN_SIGN: Buffer.from('<', BASE_ENCODE)[0],
    GREATER_THAN_SIGN: Buffer.from('>', BASE_ENCODE)[0],
    LEFT_SQUARE_BRACKET: Buffer.from('[', BASE_ENCODE)[0],
    RIGHT_SQUARE_BRACKET: Buffer.from(']', BASE_ENCODE)[0],
    LEFT_CURLY_BRACKET: Buffer.from('{', BASE_ENCODE)[0],
    RIGHT_CURLY_BRACKET: Buffer.from('}', BASE_ENCODE)[0],
    SOLIDUS: Buffer.from('/', BASE_ENCODE)[0],
    REVERSE_SOLIDUS: Buffer.from('\\', BASE_ENCODE)[0],
    PERCENT_SIGN: Buffer.from('%', BASE_ENCODE)[0],
    NUMBER_SIGN: Buffer.from('#', BASE_ENCODE)[0],
    DOUBLE_LESS_THAN_SIGN: Buffer.from('<<', BASE_ENCODE),
    DOUBLE_GREATER_THAN_SIGN: Buffer.from('>>', BASE_ENCODE),

    NULL: Buffer.from('null', BASE_ENCODE),
    TRUE: Buffer.from('true', BASE_ENCODE),
    FALSE: Buffer.from('false', BASE_ENCODE),

    XREF: Buffer.from('xref', BASE_ENCODE),
    TRAILER: Buffer.from('trailer', BASE_ENCODE),
    STARTXREF: Buffer.from('startxref', BASE_ENCODE),
    EOF_MARKER: Buffer.from('%%EOF', BASE_ENCODE),
    BOOL_TRUE: Buffer.from('true', BASE_ENCODE),
    BOOL_FALSE: Buffer.from('false', BASE_ENCODE),

    PLUS_SIGN: Buffer.from('+', BASE_ENCODE)[0],
    MINUS_SIGN: Buffer.from('-', BASE_ENCODE)[0],
    DOT_SIGN: Buffer.from('.', BASE_ENCODE)[0],
    DIGIT_0: Buffer.from('0', BASE_ENCODE)[0],
    DIGIT_7: Buffer.from('7', BASE_ENCODE)[0],
    DIGIT_9: Buffer.from('9', BASE_ENCODE)[0],

    HEX_0: Buffer.from('0', BASE_ENCODE)[0],
    HEX_9: Buffer.from('9', BASE_ENCODE)[0],
    HEX_A: Buffer.from('A', BASE_ENCODE)[0],
    HEX_Z: Buffer.from('Z', BASE_ENCODE)[0],
    HEX_a: Buffer.from('a', BASE_ENCODE)[0],
    HEX_z: Buffer.from('z', BASE_ENCODE)[0],

    INDIRECT_REFERENCE_KEY: Symbol("R"),
    INDIRECT_OBJ_INUSE: Symbol("in-use"),
    INDIRECT_OBJ_FREE: Symbol("free")
});


const {
    ASCII_SPACE,
    ASCII_HT,
    ASCII_LF,
    ASCII_CR,
    ASCII_FF,
    ASCII_NULL,

    DIGIT_0, DIGIT_7, DIGIT_9,

    HEX_0, HEX_9, HEX_A, HEX_Z, HEX_a, HEX_z,

} = exports;

exports.isSpace = function (o) {
    return o === ASCII_SPACE
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_CR
        || o === ASCII_FF
        || o === ASCII_NULL;
    // #TODO: run statistics to get the best sorting
};

exports.isDigit = function (o) {
    return DIGIT_0 <= o && o <= DIGIT_9;
};

exports.isHexDigit = function (o) {
    return (HEX_0 <= o && o <= HEX_9) || (HEX_A <= o && o <= HEX_Z) || (HEX_a <= o && o <= HEX_z);
};

exports.isOctalDigit = function (o) {
    return DIGIT_0 <= o && o <= DIGIT_7;
};

exports.encode = function (jsString) {
    return Buffer.from(jsString, BASE_ENCODE)
};

// check is Js string
exports.isJsString = function (o) {
    return typeof o === 'string' || o instanceof String
};

module.exports = exports