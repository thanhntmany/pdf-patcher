'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFRandomAccess = require('./pdf-buffer-parser');

var sample = `
<<
/Info 46 0 R
/Root 1 0 R
/Size 47
>>
`;

var pdf = new PDFRandomAccess.PDFParser(Buffer.from(sample, 'ascii'));

console.log(pdf.buf.toString())
console.log("---------------")
console.log(pdf.parseDictionary())

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


// var pdfra = PDFRandomAccess.fromFile('./tmpl_page2.pdf').loadXref();
// console.log(pdfra)
