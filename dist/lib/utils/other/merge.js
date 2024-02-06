"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeObjects = exports.mergeArray = void 0;
function mergeArray(arr1, arr2, options = { mutate: false, typeCheck: false }) {
    const { mutate = false, typeCheck = false } = options;
    const merged = mutate ? arr1 : [...arr1];
    for (const [index, item] of arr2.entries()) {
        if (typeCheck) {
            if (typeof item === typeof merged[0]) {
                merged[index] = item;
            }
            continue;
        }
        merged[index] = item;
    }
    return merged;
}
exports.mergeArray = mergeArray;
function mergeObjects(obj1, obj2, options = {
    mutate: false,
    typeCheck: false,
    typeCheckUndefined: true
}) {
    const { mutate = false, typeCheck = false, typeCheckUndefined = true } = options;
    if (Array.isArray(obj1) || Array.isArray(obj2)) {
        return obj2;
    }
    const merged = mutate ? obj1 : { ...obj1 };
    for (const key in obj2) {
        if (!Object.prototype.hasOwnProperty.call(obj2, key) || key === '__proto__' || key === 'constructor.prototype') {
            continue;
        }
        const keyInBoth = key;
        const obj1Value = obj1[keyInBoth];
        const obj2Value = obj2[keyInBoth];
        if (typeof obj1Value === 'object' && typeof obj2Value === 'object') {
            merged[keyInBoth] = mergeObjects(obj1Value, obj2Value, options);
            continue;
        }
        if (!typeCheck || (!typeCheckUndefined && obj1Value === undefined) || typeof obj1Value === typeof obj2Value) {
            merged[keyInBoth] = obj2Value;
        }
    }
    return merged;
}
exports.mergeObjects = mergeObjects;
