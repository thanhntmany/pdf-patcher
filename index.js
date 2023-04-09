'use strict';

const PDFHandler = require('./pdf-handler');

// var ph = PDFHandler.fromFile('./tmpl_page2.pdf');
var ph = PDFHandler.fromFile('./template/template_full.pdf');
// console.dir(ph)

var r = ph.root;
// console.dir(r)
// r.prop('Pages', 'Kids', 0).dir();

// r.prop('Pages', 'Kids', 2).dir();

var Kids = r.prop('Pages', 'Kids');

var i, l = ph.getNoPages(), content;
for (i=0; i<l; i++) {
    console.log(`\n -- ${i} ---------------------------`)
    // Kids.prop(i, 'Resources', 'Font', 'F1').dir();

    ph.isolatePage(i).dir()

    // content = Kids.prop(i, 'Contents', 0).value().toString();
    // console.log(content);
};