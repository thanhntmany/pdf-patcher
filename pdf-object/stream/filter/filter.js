'use strict';
const { join } = require('path');


const cacheFilterHandler = {};
module.exports = exports = function getFilterHandler(filterName) {
    if (cacheFilterHandler.hasOwnProperty(filterName)) return cacheFilterHandler[filterName];

    try {
        return cacheFilterHandler[filterName] = require(join(__dirname, filterName));
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            console.error(`\nERROR: Cannot find handler for filter "${filterName}"!!\n`)
        }
        else throw error;
    }

    return undefined;
};

exports.cacheFilterHandler = cacheFilterHandler;