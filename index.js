'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFPaser = require('./pdf-paser');


/*
 * PDFFileHandler
 */
function PDFFileHandler(file) {
    this.paser = PDFPaser.fromFile(file);
};
const PDFFileHandler_proto = PDFFileHandler.prototype;

PDFFileHandler_proto.initXrefTable = function() {
    
}

var pdf = new PDFFileHandler('./tmpl_page2.pdf')

console.log(pdf);
console.log(pdf.paser.viewBytesFrom(130127, 20).toString());

// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)