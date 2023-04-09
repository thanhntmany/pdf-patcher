'use strict';


/*
 * PDFHandler
 */
function PDFPageHandler(pageWalker, pdfHandler) {
    this.pdf = pdfHandler;
    this.walker = pageWalker;
};
const _proto = PDFPageHandler.prototype;


_proto.patchContent = function(patchingMap) {
    this.walker.dir();
    return this;
};


module.exports = exports = PDFPageHandler;
