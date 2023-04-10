'use strict';


/*
 * PDFHandler
 */
function PDFPageHandler(pageWalker, pdfHandler) {
    this.pdf = pdfHandler;
    this.walker = pageWalker;
};
const _proto = PDFPageHandler.prototype;

_proto.incrementalUpdateContentStream = function (contentStreamObj, patchingMap) {

};

_proto.incrementalUpdateContents = function (patchingMap) {

    // console.log("\n-- Resources ----------------");
    // this.walker.prop("Resources").dir();

    console.log("\n-- Contents ----------------");
    console.log(this.walker.prop("Contents", 0));

    console.log("\n-- END Contents ----------------");
    // console.log(this.walker.prop("Contents", 0).value().toString());
    return this;
};


module.exports = exports = PDFPageHandler;
