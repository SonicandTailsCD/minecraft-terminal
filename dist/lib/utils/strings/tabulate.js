"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tab = void 0;
function tab(str1, str2, maxLength) {
    return str1.padEnd(maxLength, ' ') + str2;
}
exports.tab = tab;
