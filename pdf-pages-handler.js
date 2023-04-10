'use strict';
const PDFPageHandler = require('./pdf-page-handler');


/*
 * PDFHandler
 */
function PDFPagesHandler(pagesWalker, pdfHandler) {
    this.pdf = pdfHandler;
    this.walker = pagesWalker;
};
const _proto = PDFPagesHandler.prototype;

_proto.dir = function () {
    return this.walker.dir();
};

_proto.getFlattenKidsArray = function (pagesWalker) {
    if (pagesWalker === undefined) pagesWalker = this.walker;

    var out = [], item, kids = this.walker.prop("Kids"),
        i, l = kids.value('length');
    for (i = 0; i < l; i++) {
        item = kids.prop(i);
        switch (item.value("Type")) {
            case "Pages":
                out = out.concat(_proto.getFlattenKidsArray(item));
                break;

            case "Page":
                out.push(item);
                break;

            default:
                break;
        };
    };

    return out;
};

_proto.getArrayOfPage = function () {
    return this
        .getFlattenKidsArray()
        .map(pageWalker => new PDFPageHandler(pageWalker, this.pdf))
};

module.exports = exports = PDFPagesHandler;
