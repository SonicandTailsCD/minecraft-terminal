"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = void 0;
function compare(ver1, ver2) {
    const splitVer1 = ver1.split('.');
    const splitVer2 = ver2.split('.');
    const maxLength = Math.max(splitVer1.length, splitVer2.length);
    for (let i = 0; i < maxLength; i++) {
        const num1 = Number(splitVer1[i]) || 0;
        const num2 = Number(splitVer2[i]) || 0;
        if (num1 > num2) {
            return i + 1;
        }
        else if (num1 < num2) {
            return -(i + 1);
        }
    }
    return 0;
}
exports.compare = compare;
