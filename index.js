'use strict';

const PDFHandler = require('./pdf-handler');

// var pdf = PDFHandler.fromFile('./tmpl_page2.pdf');
var pdf = PDFHandler.fromFile('./template/template_full.pdf');

var pages = pdf.getPages();
// var kids = pages.getArrayOfPage(), kid;
// for (kid of kids) {
//     console.log(kid)
// };

console.dir(pdf.parser.cache, {depth: null});

// var patchingMap = {
//     FULL_NAME: "XxXxXxX"
// };

// var tPage = kids[0];
// tPage.incrementalUpdateContents(patchingMap);