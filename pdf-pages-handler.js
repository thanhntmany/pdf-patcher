'use strict';


/*
 * PDFHandler
 */
function PDFPagesHandler(pageWalker, pdfHandler) {
    this.pdf = pdfHandler;
    this.walker = pageWalker;
};
const _proto = PDFPagesHandler.prototype;

_proto.dir = function () {
    return this.walker.dir();
};

_proto.getFlattenKidsArray = function (pagesWalker) {
    if (pagesWalker === undefined) pagesWalker = this.walker;

    var out = [], item, kids = this.walker.prop("Kids"),
        i, l = kids.value().length;

    console.count("loop")

    for (i = 0; i < l; i++) {
        item = kids.prop(i);
        switch (item.prop("Type").value()) {
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

module.exports = exports = PDFPagesHandler;
