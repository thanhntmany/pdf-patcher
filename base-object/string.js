'use strict';
const { Buffer } = require('buffer');
const {
    ASCII_n, ASCII_r, ASCII_t, ASCII_b, ASCII_f,
    ASCII_LF, ASCII_CR, ASCII_HT, ASCII_BS,  

    HEX_0,
    LEFT_PARENTHESIS,
    RIGHT_PARENTHESIS,
    LESS_THAN_SIGN,
    GREATER_THAN_SIGN,
    REVERSE_SOLIDUS,

    isSpace,
    isHexDigit,
    isOctalDigit
} = require('./base');



function PDFOString(uint8ArrayLike) {
    this._ = uint8ArrayLike;
};
const _class = PDFOString, _proto = _class.prototype;


_class.parseStringLiteral = function (parser) {
    var p = parser.p, buf = parser.buf, o = buf[p++];
    if (o !== LEFT_PARENTHESIS) return undefined;

    var depth = 0, ddd;
    var t = [];

    while ((o = buf[p++]) !== undefined && !(o === RIGHT_PARENTHESIS && depth === 0)) {
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
                        if (isOctalDigit(o = buf[p])) {
                            ddd.push(o); p++;
                            if (isOctalDigit(o = buf[p])) {
                                ddd.push(o); p++;
                            };
                        };
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
        o = buf[p];
    };

    parser.p = p;
    return new this(Buffer.from(t));
};

_class.parseStringHex = function (parser) {
    var p = parser.p, buf = parser.buf, o;

    if ((o = buf[p++]) !== LESS_THAN_SIGN) return undefined;

    var t = [];
    while ((o = buf[p++]) !== undefined)
        if (isHexDigit(o)) {
            t.push(o);
        }
        else if (o === GREATER_THAN_SIGN) {
            break;
        }
        else if (!isSpace(o)) {
            // p--; break;
            console.error(`Parsing StringHex failed at: \n${parser.sub(p, 100)}\n`);
            console.trace();
            return undefined;
        };

    if (t.length % 2 === 1) t.push(HEX_0); // Ref: PDF32000_2008.pdf - 7.3.4.3 Hexadecimal Strings - EXAMPLE 2

    parser.p = p;
    return new this(Buffer.from(Buffer.from(t).toString(BASE_ENCODE), 'hex'));
};

_class.parse = function (parser) {
    var o = parser.buf[parser.p];

    if (o === LESS_THAN_SIGN) return this.parseStringHex(parser);
    else if (o === LEFT_PARENTHESIS) return this.parseStringLiteral(parser);
    return undefined;
};

_proto.value = function () {
    return this._;
};

_proto.toJSON = function () {
    return this._;
};

_proto.toString = function () {
    return String(this._);
};

_proto.toPdf = function () {
    // #TODO:
};


module.exports = exports = _class;
