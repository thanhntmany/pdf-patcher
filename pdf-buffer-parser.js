'use strict';
const Os = require('os');
const { Buffer } = require('buffer');
const Fs = require('fs');

const BASE_ENCODE = 'ascii',
    ASCII_NULL = 0,
    ASCII_HT = 9,
    ASCII_LF = 10,
    ASCII_FF = 12,
    ASCII_CR = 13,
    ASCII_BS = 8,
    ASCII_SPACE = 32,

    ASCII_n = Buffer.from('n', BASE_ENCODE)[0],
    ASCII_r = Buffer.from('r', BASE_ENCODE)[0],
    ASCII_t = Buffer.from('t', BASE_ENCODE)[0],
    ASCII_b = Buffer.from('b', BASE_ENCODE)[0],
    ASCII_f = Buffer.from('f', BASE_ENCODE)[0],

    LEFT_PARENTHESIS = Buffer.from('(', BASE_ENCODE)[0],
    RIGHT_PARENTHESIS = Buffer.from(')', BASE_ENCODE)[0],
    LESS_THAN_SIGN = Buffer.from('<', BASE_ENCODE)[0],
    GREATER_THAN_SIGN = Buffer.from('>', BASE_ENCODE)[0],
    LEFT_SQUARE_BRACKET = Buffer.from('[', BASE_ENCODE)[0],
    RIGHT_SQUARE_BRACKET = Buffer.from(']', BASE_ENCODE)[0],
    LEFT_CURLY_BRACKET = Buffer.from('{', BASE_ENCODE)[0],
    RIGHT_CURLY_BRACKET = Buffer.from('}', BASE_ENCODE)[0],
    SOLIDUS = Buffer.from('/', BASE_ENCODE)[0],
    REVERSE_SOLIDUS = Buffer.from('\\', BASE_ENCODE)[0],
    PERCENT_SIGN = Buffer.from('%', BASE_ENCODE)[0],
    NUMBER_SIGN = Buffer.from('#', BASE_ENCODE)[0],
    DOUBLE_LESS_THAN_SIGN = Buffer.from('<<', BASE_ENCODE),
    DOUBLE_GREATER_THAN_SIGN = Buffer.from('>>', BASE_ENCODE),

    TRAILER = Buffer.from('trailer', BASE_ENCODE),
    STARTXREF = Buffer.from('startxref', BASE_ENCODE),
    EOF_MARKER = Buffer.from('%%EOF', BASE_ENCODE),
    BOOL_TRUE = Buffer.from('true', BASE_ENCODE),
    BOOL_FALSE = Buffer.from('false', BASE_ENCODE),

    PLUS_SIGN = Buffer.from('+', BASE_ENCODE)[0],
    MINUS_SIGN = Buffer.from('-', BASE_ENCODE)[0],
    DOT_SIGN = Buffer.from('.', BASE_ENCODE)[0],
    DIGIT_0 = Buffer.from('0', BASE_ENCODE)[0],
    DIGIT_7 = Buffer.from('7', BASE_ENCODE)[0],
    DIGIT_9 = Buffer.from('9', BASE_ENCODE)[0],

    HEX_0 = Buffer.from('0', BASE_ENCODE)[0],
    HEX_9 = Buffer.from('9', BASE_ENCODE)[0],
    HEX_A = Buffer.from('A', BASE_ENCODE)[0],
    HEX_Z = Buffer.from('Z', BASE_ENCODE)[0],
    HEX_a = Buffer.from('a', BASE_ENCODE)[0],
    HEX_z = Buffer.from('z', BASE_ENCODE)[0]
    ;

function isSpace(o) {
    return o === ASCII_SPACE
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_CR
        || o === ASCII_FF
        || o === ASCII_NULL;
    // #TODO: run statistics to get the best sorting
};

function isDigit(o) {
    return DIGIT_0 <= o && o <= DIGIT_9;
};

function isOctalDigit(o) {
    return DIGIT_0 <= o && o <= DIGIT_7;
};

function isHexDigit(o) {
    return (HEX_0 <= o && o <= HEX_9) || (HEX_A <= o && o <= HEX_Z) || (HEX_a <= o && o <= HEX_z);
};

/*
 * PDFRandomAccess
 */
function PDFRandomAccess(buffer) {
    this.buf = Buffer.from(buffer);
    this.p = 0;// pointer
    this.cache = {};
};
const RA_proto = PDFRandomAccess.prototype;

RA_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

RA_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

/* Access Object at byteOffset */
RA_proto.setP = function (p) {
    this.p = p;
    return this;
};

RA_proto.indexOfNextLine = function () {
    var p = this.p, l = this.buf.length;
    if (p >= l) return l;

    var buf = this.buf, o; while (p < l) {
        if ((o = buf[p]) === ASCII_LF) return p + 1;// LF
        if (o === ASCII_CR) {
            if (buf[p + 1] === ASCII_LF) return p + 2;// CR LF
            return p + 1;//CR
        };
        p++;
    };

    return l;
};

RA_proto.readLine = function () {
    var p = this.p;
    return this.sub(p, (this.p = this.indexOfNextLine()));
};

RA_proto.skipSpaces = function () {
    var p = this.p, buf = this.buf, o, l = buf.length;

    while (p < l) {
        o = buf[p];
        if (!isSpace(o)) return (this.p = p);
        if (o === PERCENT_SIGN) p = this.indexOfNextLine(p); // Skip comment
        p++;
    };

    return (this.p = l);
};


// Parsing Objects
RA_proto.parseBoolean = function () {
    var p = this.p, buf = this.buf;
    if (BOOL_TRUE.equals(buf.subarray(p, p + BOOL_TRUE.length))) {
        this.p = p + BOOL_TRUE.length;
        return true;
    };
    if (BOOL_FALSE.equals(buf.subarray(p, p + BOOL_FALSE.length))) {
        this.p = p + BOOL_FALSE.length;
        return false;
    };
    return undefined;
};

RA_proto.parseNumber = function () {
    var p = this.p, buf = this.buf, o;
    var num = [];

    o = buf[p];
    if (o === MINUS_SIGN) {
        num.push(MINUS_SIGN)
        p++;
    }
    else if (o === PLUS_SIGN) {
        num.push(PLUS_SIGN)
        p++;
    };

    while (true) {
        o = buf[p];
        if (!isDigit(o)) break;
        num.push(o);
        p++;
    };

    o = buf[p];
    if (o === DOT_SIGN) {
        num.push(DOT_SIGN);
        p++;
        while (true) {
            o = buf[p];
            if (!isDigit(o)) break;
            num.push(o);
            p++;
        };
    };

    this.p = p;
    if (num.length === 0) return NaN;
    return Number(Buffer.from(num).toString());
};


RA_proto.parseStringLiteral = function () {
    var p = this.p, buf = this.buf, o = buf[p++];
    if (o !== LEFT_PARENTHESIS) return undefined;

    var depth = 0, ddd;
    var t = [];

    o = buf[p++];
    while (o !== undefined && (o !== RIGHT_PARENTHESIS || depth !== 0)) {

        if (o === REVERSE_SOLIDUS) {
            switch (o = buf[p++]) {
                case ASCII_n: o = ASCII_LF; break;
                case ASCII_r: o = ASCII_CR; break;
                case ASCII_t: o = ASCII_HT; break;
                case ASCII_b: o = ASCII_BS; break;
                case ASCII_f: o = ASCII_FF; break;
                case LEFT_PARENTHESIS: o = LEFT_PARENTHESIS; break;
                case RIGHT_PARENTHESIS: o = RIGHT_PARENTHESIS; break;
                case REVERSE_SOLIDUS: o = REVERSE_SOLIDUS; break;
                case ASCII_LF:
                case ASCII_CR:
                    if (buf[p] === ASCII_LF) p++;
                    continue;
                default:
                    if (isOctalDigit(o)) {
                        ddd = [o];
                        if (isOctalDigit(o = buf[p++])) {
                            ddd.push(o);
                            if (isOctalDigit(o = buf[p++])) {
                                ddd.push(o);
                            } else p--;
                        } else p--;
                        o = parseInt(Buffer.from(ddd).toString(BASE_ENCODE), 8);
                    };
                    break;
            };
        }
        else if (o === LEFT_PARENTHESIS) {
            depth++;
        }
        else if (o === RIGHT_PARENTHESIS) {
            depth--;
        };

        t.push(o);
        o = buf[p++];
    };

    return Buffer.from(t).toString();
};

RA_proto.parseStringHex = function () {
    var p = this.p, buf = this.buf, o = buf[p++];
    if (o !== LESS_THAN_SIGN) return null;

    var t = [];
    do {
        if (isHexDigit(o = buf[p++])) t.push(o);
    }
    while (o !== GREATER_THAN_SIGN);

    this.p = p;
    return Buffer.from(Buffer.from(t).toString(BASE_ENCODE), 'hex').toString();
};

RA_proto.parseString = function () {
    var o = this.buf[this.p];

    if (o === LESS_THAN_SIGN) return this.parseStringHex();
    else if (o === LEFT_PARENTHESIS) return this.parseStringLiteral();
    return null;
};

// Strings, Names
// Arrays
// Dictionaries
// Streams
// null object


/*
* PDFParser
*/
function PDFParser(buffer) { //https://nodejs.org/api/buffer.html#class-buffer
    this.randomAccess = new PDFRandomAccess(buffer);
};

PDFParser.fromFile = function (file) {
    return new this(Fs.readFileSync(file));
};

const _proto = PDFParser.prototype;


/*
 * Base operations
 */
_proto.resetPointer = function (byteOffset) {
    this.pointer = byteOffset || 0;
};

_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

_proto.indexOfNextLine = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset, l = this.buf.length;
    if (p >= l) return l;

    var buf = this.buf, o; while (p < l) {
        if ((o = buf[p]) === ASCII_LF) return p + 1;// LF
        if (o === ASCII_CR) {
            if (buf[p + 1] === ASCII_LF) return p + 2;// CR LF
            return p + 1;//CR
        };
        p++;
    };

    return l;
};

_proto.readLine = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset;
    return this.sub(p, (this.pointer = this.indexOfNextLine(p)));
};

_proto.isWhitespace = function (o) {
    return o === ASCII_NULL
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_FF
        || o === ASCII_CR
        || o === ASCII_SPACE
}

_proto.skipSpaces = function (byteOffset) {
    var p = isNaN(byteOffset) ? this.pointer : byteOffset, buf = this.buf, o, l = buf.length;

    while (p < l) {
        o = buf[p];
        if (!(o === ASCII_NULL
            || o === ASCII_HT
            || o === ASCII_LF
            || o === ASCII_FF
            || o === ASCII_CR
            || o === ASCII_SPACE
        )) return (this.pointer = p);

        // Skip comment
        if (o === PERCENT_SIGN) p = this.indexOfNextLine(p);

        p++;
    };

    return (this.pointer = l);
};


/*
 * Parsing Objects
 */


_proto.isEndOfName = function (o) {
    return o === ASCII_NULL
        || o === ASCII_HT
        || o === ASCII_LF
        || o === ASCII_FF
        || o === ASCII_CR
        || o === ASCII_SPACE
        || o === LESS_THAN_SIGN
        || o === GREATER_THAN_SIGN
        || o === LEFT_SQUARE_BRACKET
        || o === RIGHT_SQUARE_BRACKET
        || o === LEFT_PARENTHESIS
        || o === RIGHT_PARENTHESIS
        || o === PERCENT_SIGN
        || o === SOLIDUS
}

_proto.parseName = function () {
    var p = this.pointer, buf = this.buf, o, name = [];

    while (true) {
        o = buf[p];
        if (o === NUMBER_SIGN) {
            var t = Buffer.from([buf[p + 1], buf[p + 2]]).toString();
            if (isNaN(t)) {
                console.error("Error: expected hex digit, actual='" + t + "'");
                console.trace();
            }
            else {
                p += 2;
                name.push(parseInt(t))
            };
        }
        else if (this.isEndOfName(o)) {
            break;
        }
        else {
            name.push(o)
        };
        p++;
    };

    this.pointer = p;
    return Buffer.from(name).toString();
};

_proto.parseRADictionaryNameValuePair = function (obj) {
    var key = this.parseName();

};

_proto.parseRADictionary = function (byteOffset) {
    var buf = this.buf, p, o;
    var obj = {}, e;

    p = buf.indexOf(DOUBLE_LESS_THAN_SIGN, byteOffset)
    while (true) {
        p = this.skipSpaces(p);
        o = buf[p];
        if (o === GREATER_THAN_SIGN && buf[p + 1] === GREATER_THAN_SIGN) break;

        if (o === SOLIDUS) {
            this.parseDictionaryNameValuePair(obj)
        }
        else {
            console.error("Invalid dictionary, found: '" + String(o) + "' but expected: '/' at offset " + String(p));
        };

        p++;
    }

    return obj;
}



/*
 * Main operations
 */
const PDF_HEADER = Buffer.from("%PDF-", BASE_ENCODE);
_proto.parseHeader = function () {
    var p = this.buf.indexOf(PDF_HEADER);
    var header = this.sub(p, this.indexOfNextLine(p)).toString().replace(/^\s+|\s+$/g, "");
    var tokens = header.match(/\d+/g);
    return {
        header: header,
        version: tokens
    };
};

_proto.parseStartXref = function (byteOffset) {
    var pEOF = this.buf.lastIndexOf(EOF_MARKER, byteOffset || -1);
    var pSTARTXREF = this.buf.lastIndexOf(STARTXREF, pEOF);
    return parseInt(this.readLine(this.indexOfNextLine(pSTARTXREF)).toString());
};

_proto.parseXrefBuf = function () {

};

_proto.parseXref = function () {

};

_proto.parseTrailer = function (byteOffset) {

};
// #TODO: extract parsing procedure outof main operations


module.exports = exports = PDFParser