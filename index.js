'use strict';
const { Buffer } = require('buffer');
const Fs = require('fs');
const PDFPaser = require('./pdf-paser');


/*
 * PDFHandler
 */
function PDFHandler(file) {
    this.paser = PDFPaser.fromFile(file);
    this.init()
};
const PDFHandler_proto = PDFHandler.prototype;

PDFHandler_proto.init = function() {
    this.header = this.paser.parsePDFHeader();
    this.xref = this.paser.parsePDFHeader();
}


var pdf = new PDFHandler('./tmpl_page2.pdf')

// console.log(pdf);
// pdf.paser.readLine()
console.log(pdf);

// const nodeBuffer = Buffer.from([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
// console.log(nodeBuffer.byteOffset)
// console.log(Buffer.poolSize)