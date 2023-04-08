'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFHandler = require('./pdf-handler');
const PDFRandomAccess = require('./pdf-buffer-parser');


// var sample = `
// /Name1
// /ASomewhatLongerName
// /A;Name_With-Various***Characters?
// /1.2
// /$$
// /@pattern
// /.notdef
// /lime#20Green
// /paired#28#29parentheses
// /The_Key_of_F#23_Minor
// /A#42
// `;

// var pdf = new PDFParser(Buffer.from(sample, 'ascii'));


// var i, l = pdf.randomAccess.buf.length, v;
// for (i = 0; i < l; i++) {
//    v = pdf.randomAccess.setP(i).parseName();
//    if (typeof v === 'string' || v instanceof String) console.log(i + " --> " + v);
// };

// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)

// const buf1 = Buffer.from('ABCD');
// const buf2 = Buffer.from('ABC');

// console.log(buf1.compare(buf2));


var pdfra = PDFRandomAccess.fromFile('./tmpl_page2.pdf').parser.parseHeader();
console.log(pdfra);
