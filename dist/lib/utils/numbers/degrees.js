"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unMaxDeg = exports.maxDeg = exports.degToRadian = exports.radianToDeg = void 0;
function radianToDeg(rad) {
    return -rad * 180 / Math.PI;
}
exports.radianToDeg = radianToDeg;
function degToRadian(deg) {
    return deg * Math.PI / 180;
}
exports.degToRadian = degToRadian;
function maxDeg(deg, max) {
    return deg > max ? deg - 360 : deg;
}
exports.maxDeg = maxDeg;
function unMaxDeg(deg) {
    return deg < 0 ? deg + 360 : deg;
}
exports.unMaxDeg = unMaxDeg;
