"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distance = void 0;
function distance(p1, p2) {
    const v1 = { ...{ x: 0, y: 0, z: 0 }, ...p1 };
    const v2 = { ...{ x: 0, y: 0, z: 0 }, ...p2 };
    return Math.sqrt(Math.pow(v1.x - v2.x, 2) +
        Math.pow(v1.y - v2.y, 2) +
        Math.pow(v1.z - v2.z, 2));
}
exports.distance = distance;
