"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointsInBetween = void 0;
const vec3_js_1 = require("../../vec3.js");
function pointsInBetween(v1, v2) {
    const xRange = Math.abs(v1.x - v2.x);
    const yRange = Math.abs(v1.y - v2.y);
    const zRange = Math.abs(v1.z - v2.z);
    const points = [];
    for (let x = 0; x <= xRange; x++) {
        for (let y = 0; y <= yRange; y++) {
            for (let z = 0; z <= zRange; z++) {
                const point = (0, vec3_js_1.v)(Math.min(v1.x, v2.x) + x, Math.min(v1.y, v2.y) + y, Math.min(v1.z, v2.z) + z);
                points.push(point);
            }
        }
    }
    return points;
}
exports.pointsInBetween = pointsInBetween;
