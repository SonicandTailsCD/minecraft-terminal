"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.v = exports.Vec3 = void 0;
const vec3_1 = require("vec3");
const isNumber_1 = require("./utils/numbers/isNumber");
var vec3_2 = require("vec3");
Object.defineProperty(exports, "Vec3", { enumerable: true, get: function () { return vec3_2.Vec3; } });
function v(arg1, arg2, arg3) {
    let x, y, z;
    if (typeof arg1 === 'string') {
        const [xStr, yStr, zStr] = arg1.split(',');
        x = parseFloat(xStr.trim());
        y = parseFloat(yStr.trim());
        z = parseFloat(zStr.trim());
    }
    else if ((0, isNumber_1.isNumber)(arg1) && (0, isNumber_1.isNumber)(arg2) && (0, isNumber_1.isNumber)(arg3)) {
        x = arg1;
        y = arg2;
        z = arg2;
    }
    else if (Array.isArray(arg1)) {
        [x, y, z] = arg1;
    }
    else if (typeof arg1 === 'object' && 'x' in arg1 && 'y' in arg1 && 'z' in arg1) {
        x = arg1.x;
        y = arg1.y;
        z = arg1.z;
    }
    else {
        throw new Error('Invalid input');
    }
    return new vec3_1.Vec3(x, y, z);
}
exports.v = v;
