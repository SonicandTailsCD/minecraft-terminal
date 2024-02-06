"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlyKeepKeys = void 0;
const merge_1 = require("merge");
function onlyKeepKeys(obj1, obj2, options = { shallow: false }) {
    options = Object.assign({ shallow: false }, options);
    const obj2Keys = Object.keys(obj2);
    const outObj = Object.assign({}, obj1);
    const outObjKeys = Object.keys(outObj);
    for (const key of outObjKeys) {
        const areObjects = (0, merge_1.isPlainObject)(outObj[key]) && (0, merge_1.isPlainObject)(obj2[key]);
        if (!options.shallow && areObjects) {
            outObj[key] =
                onlyKeepKeys(outObj[key], obj2[key], options);
            continue;
        }
        if (obj2Keys.includes(key)) {
            continue;
        }
        delete outObj[key];
    }
    return outObj;
}
exports.onlyKeepKeys = onlyKeepKeys;
