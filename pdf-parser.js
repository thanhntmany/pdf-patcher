'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const {
    XREF, TRAILER, STARTXREF, EOF_MARKER,
    INDIRECT_OBJ_INUSE, INDIRECT_OBJ_FREE,

    PDF_HEADER, PERCENT_SIGN, ASCII_LF, ASCII_CR,

    isSpace, isDigit, isJsString,
    PDFODictionary,
    PDFOIndirect,
    IndirectReference,

    parse
} = require('./pdf-object')();


/*
 * PDFParser
 */
function PDFParser(buffer) {
    this.buf = buffer;
    this.p = 0;// pointer

    this.trailer = this.parseTrailer();
    this.cache = {};
};

PDFParser.from = function (string, encoding) {
    return new this(Buffer.from(string, encoding));
};

PDFParser.fromFile = function (file) {
    return new this(Fs.readFileSync(file));
};

const _proto = PDFParser.prototype;

/* Access Object at byteOffset */
_proto.setP = function (p) {
    this.p = isNaN(p) ? 0 : p;
    return this;
};

_proto.sub = function (start, end) {
    return this.buf.subarray(start, end);
};

_proto.subFrom = function (start, length) {
    return this.buf.subarray(start, start + length);
};

_proto.logHere = function (l) {
    console.log("Current p: ", this.p)
    console.log(this.subFrom(this.p, l || 100).toString())
};

_proto.indexOfNextLine = function (p) {
    if (isNaN(p)) p = this.p;

    var buf = this.buf, l = buf.length, o;
    while (p < l) {
        if ((o = buf[p]) === ASCII_LF) return p + 1;// LF
        if (o === ASCII_CR) {
            if (buf[p + 1] === ASCII_LF) return p + 2;// CR LF
            return p + 1;//CR
        };
        p++;
    };

    return l;
};

/* ==== work with "p" property ==== */
_proto.skipSpaces = function () {
    var p = this.p, buf = this.buf, o, l = buf.length;
    while (p < l) {
        o = buf[p];
        if (o === PERCENT_SIGN) p = this.indexOfNextLine(p); // Skip comment
        if (!isSpace(o)) {
            this.p = p;
            return this;
        };
        p++;
    };
    this.p = l
    return this;
};

_proto.goToLast = function (expectedBuf) {
    this.p = this.buf.lastIndexOf(expectedBuf, this.p);
    return this;
};

_proto.goToNext = function (expectedBuf) {
    this.p = this.buf.indexOf(expectedBuf, this.p);
    return this;
};

_proto.passTheNext = function (expectedBuf) {
    this.p = this.buf.indexOf(expectedBuf, this.p);
    if (this.p >= 0) this.p += expectedBuf.length || 1;// asume: The length of octect is 1.
    return this;
};

_proto.passDigits = function () {
    var buf = this.buf, p = this.p, start = p;
    while (isDigit(buf[p++])) { };
    return parseInt(this.sub(start, (this.p = p)).toString());
};

_proto.goToNextLine = function () {
    this.p = this.indexOfNextLine(this.p)
    return this;
};

_proto.skipExpectedBuf = function (expectedBuf) {
    var p = this.p, l = expectedBuf.length;

    if (this.subFrom(p, l).compare(expectedBuf) === 0) {
        this.p += l;
        return true;
    };

    return false;
};

_proto.skipExpectedOct = function (oct) {
    if (this.buf[this.p] === oct) {
        this.p += 1;
        return true;
    };

    return false;
};

_proto.readLine = function () {
    return this.sub(this.p, (this.p = this.indexOfNextLine(this.p)));
};

// Parsing ------
_proto.parseObject = function () {
    return parse(this);
};

_proto.loadObject = function (num, gen) {
    var offset = this.getIndirectObjectOffset(num, gen || 0);
    if (isNaN(offset)) return undefined;
    return PDFOIndirect.parse(this.setP(offset).skipSpaces()).value;
};

_proto.getObject = function (num, gen) {
    if (isNaN(gen)) gen = 0;
    var cache = this.cache, key = this.genXrefObjectKey(num, gen);
    return cache.hasOwnProperty(key) ? cache[key] : cache[key] = this.loadObject(num, gen);
};

// Might return wrong value with the cases of primitive-types obj.
_proto.getKeyOfLoadedObject = function (obj) {
    var key, cache = this.cache;
    for (key in this.cache) if (cache[key] === obj) return key;
    return undefined;
};

// Work with indirect objects
_proto.genIndirectReference = function (gen_number, obj_number) {
    return new IndirectReference(obj_number, gen_number)
};

// Might return wrong value with the cases of primitive-types obj.
_proto.getRefOfLoadedObject = function (obj) {
    var key = this.getKeyOfLoadedObject(obj);
    if (!isJsString(key)) return key;
    var tokens = key.split("-");
    return this.genIndirectReference(tokens.pop(), tokens.pop());
};

_proto.resolve = function (obj) {
    return obj instanceof IndirectReference ? this.getObject(obj.num, obj.gen) : obj;
};

_proto.resolveIn = function (obj, ...subs) {
    var sub; while (subs.length > 0) {
        sub = subs.shift();
        obj = this.resolve(obj.prop instanceof Function ? obj.prop(sub) : obj[sub]);
    };
    return obj;
};

_proto.getIndirectObjectOffset = function (num, gen) {
    if (isNaN(gen)) gen = 0;
    var key = this.genXrefObjectKey(num, gen);

    var xref = this.trailer;

    if (xref.xrefTable.hasOwnProperty(key)) {
        var entry = xref.xrefTable[key];
        if (entry.status === INDIRECT_OBJ_FREE) return null;

        // Assume: entry.status === INDIRECT_OBJ_INUSE
        return entry.p
    };

    // #TODO: nested case, xrefstrm
};

// Parsing PDF File Structure
_proto.parseHeader = function () {
    var header = this.setP(0).goToNext(PDF_HEADER).readLine().toString().replace(/^\s+|\s+$/g, "");
    return {
        header: header,
        version: header.match(/\d+/g)
    };
};

_proto.genXrefObjectKey = function (num, gen) {
    return String(num) + "-" + String(gen)
};

const XREFSUBSECTION_SPLIT_REGEX = /\s/g;
_proto.parseXrefSubsection = function () {
    var out = {}, key,
        tks = this.readLine().toString().split(XREFSUBSECTION_SPLIT_REGEX),
        start = parseInt(tks.shift()), end = start + parseInt(tks.shift()), i;

    for (i = start; i < end; i++) {
        tks = this.readLine().toString().split(XREFSUBSECTION_SPLIT_REGEX);
        key = this.genXrefObjectKey(i, parseInt(tks[1]));
        if (tks[2] === 'f') {
            out[key] = {
                status: INDIRECT_OBJ_FREE,
                nextFreeObjNo: parseInt(tks[0])
            };
        }
        else if (tks[2] === 'n') {
            out[key] = {
                status: INDIRECT_OBJ_INUSE,
                p: parseInt(tks[0])
            };
        };
    };

    return out;
};

_proto.parseXrefTable = function () {
    this.goToNext(XREF).goToNextLine();

    var out = {};
    while (isDigit(this.buf[this.p])) {
        Object.assign(out, this.parseXrefSubsection())
    };

    return out;
};

_proto.parseTrailerObj = function () {
    return PDFODictionary.parse(this.passTheNext(TRAILER).skipSpaces());
};

// reverse lookup from this.p
_proto.parseStartXref = function () {
    return parseInt(this.goToLast(EOF_MARKER).goToLast(STARTXREF).goToNextLine().readLine().toString());
};

// @param p: shall point to the %%EOF of target trailer
_proto.parseTrailer = function (p) {
    this.setP(this.setP(p || -1).parseStartXref());
    return {
        xrefTable: this.parseXrefTable(),
        trailerObj: this.parseTrailerObj()
    }
};

// Specific for decodeExternalStream
_proto.loadFileSpecification = function (F) {
    // #TODO: 
};

_proto.genWalker = function (obj) {
    return new Walker(obj, this)
};

_proto.getRootWalker = function () {
    return this.genWalker(this.resolve(this.trailer.trailerObj.prop("Root")));
};


/*
 * Walker
 */
function Walker(obj, root) {
    this.obj = obj;
    this.root = root;
};
const Walker_proto = Walker.prototype;

Walker_proto.prop = function () {
    return new this.constructor(
        this.root.resolveIn.apply(this.root, [this.obj].concat(Array.prototype.slice.call(arguments))),
        this.root);
};

Walker_proto.value = function () {
    var obj = (arguments.length > 0 ? this.prop.apply(this, arguments) : this).obj
    return obj.toJs instanceof Function ? obj.toJs() : obj;
};

Walker_proto.toJSON = function () {
    return this.obj;
};

Walker_proto.dir = function () {
    console.dir(this.toJSON(), { depth: null });
};


module.exports = exports = PDFParser;
