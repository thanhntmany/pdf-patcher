'use strict';
const { Buffer } = require('buffer');
const { encode, ASCII_R } = require('./base');



function IndirectReference(obj_number, gen_number) {
    this.num = obj_number;
    this.gen = gen_number || 0;
};

const _class = IndirectReference, _proto = _class.prototype;


_proto.toString = function () {
    return String(this.num) + " " + String(this.gen) + " R";
};

_proto.toPdf = function () {
    return Buffer.from([encode(String(this.num) + " " + String(this.gen) + " "), ASCII_R]);
};


module.exports = exports = _class;
