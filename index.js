'use strict';

const PDFHandler = require('./pdf-handler');

var ph = PDFHandler.fromFile('./tmpl_page2.pdf');
console.dir(ph)

var r = ph.root;
// console.dir(r)
r.prop('Pages', 'Kids', 0).dir();
