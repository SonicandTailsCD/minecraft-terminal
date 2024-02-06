"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNumber = void 0;
function isNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
exports.isNumber = isNumber;
