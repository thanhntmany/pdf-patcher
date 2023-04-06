'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFHandler = require('./pdf-handler');


var pdf = PDFHandler.fromFile('./tmpl_page2.pdf')

// console.log(pdf);
// pdf.paser.readLine()
console.log(pdf.parser.parseStartXref());

// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)