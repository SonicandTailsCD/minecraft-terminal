"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuotedStrings = void 0;
function getQuotedStrings(str) {
    return str.match(/(?<=")[^"]+(?=")|[^\s"]+/g) || [];
}
exports.getQuotedStrings = getQuotedStrings;
