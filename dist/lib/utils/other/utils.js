"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shallowCompareObj = exports.matchEq = exports.toLowerCaseArr = exports.parseStr = exports.parseVar = void 0;
const tslib_1 = require("tslib");
const logicExp_js_1 = require("../../logicExp.js");
const index_js_1 = require("../strings/index.js");
const merge_1 = require("merge");
const isNumber_js_1 = require("../numbers/isNumber.js");
const logger = tslib_1.__importStar(require("../../log.js"));
function parseVar(str, variablesObj, options) {
    const varPrefixRegex = (0, index_js_1.escapeRegExp)(options?.varPrefix ?? '%');
    const varSuffixRegex = (0, index_js_1.escapeRegExp)(options?.varSuffix ?? '%');
    let out = str.valueOf();
    Object.keys(variablesObj).forEach((value) => {
        out = out.replace(new RegExp(varPrefixRegex + (0, index_js_1.escapeRegExp)(value) + varSuffixRegex, 'g'), variablesObj[value]);
    });
    out = out.replace(new RegExp(`${varPrefixRegex}[^${varSuffixRegex}]+${varSuffixRegex}`, 'g'), options?.undefinedVar ?? 'undefined');
    return out;
}
exports.parseVar = parseVar;
exports.parseStr = {
    parse: (str, caseSensitive = true) => {
        if ((0, isNumber_js_1.isNumber)(Number(str))) {
            return Number(str);
        }
        if (str.match(/^\s+$/) != null) {
            return '';
        }
        let out = str.valueOf();
        if (!caseSensitive) {
            out = out.toLowerCase();
        }
        if (out === 'false') {
            return false;
        }
        if (out === 'true') {
            return true;
        }
        if (out === 'null') {
            return null;
        }
        if (out === 'undefined') {
            return undefined;
        }
        return out;
    },
    parseArr: (strArr, options = { caseSensitive: true }) => {
        const out = [];
        let a = 0;
        strArr.forEach((value, index) => {
            out[a++] = exports.parseStr.parse(strArr[index], options.caseSensitive);
        });
        return out;
    }
};
function toLowerCaseArr(arr) {
    const out = [];
    for (let i = 0; i < arr.length; i++) {
        const element = arr[i];
        out[i] = element.toLowerCase?.() || element;
    }
    return out;
}
exports.toLowerCaseArr = toLowerCaseArr;
function matchEq(str, valObj) {
    let strCopy = String(str.valueOf());
    logger.debugging(strCopy, true, false);
    const matches = str.split(/[&|]/);
    const matchesStr = matches.toString();
    logger.debugging(matchesStr, true, false);
    for (let i = 0; i < matches?.length; i++) {
        const mat = matches[i];
        const op = mat.match(/=|!=/)?.[0] ?? '';
        let bef = mat.match(new RegExp(`^[^${op}]+(?=${op})`))?.[0];
        let af = mat.match(new RegExp(`(?<=${op})[^${op}]+`))?.[0];
        if (bef && bef.charAt(0) === '$') {
            bef = valObj[bef.slice(1)];
        }
        if (af && af.charAt(0) === '$') {
            af = valObj[af.slice(1)];
        }
        let out = true;
        if (op === '=' && bef?.toLowerCase?.() != af?.toLowerCase?.()) {
            out = false;
        }
        else if (op === '!=' && bef?.toLowerCase?.() == af?.toLowerCase?.()) {
            out = false;
        }
        strCopy = strCopy.replace(mat, String(out));
    }
    return (0, logicExp_js_1.logicExp)(strCopy, {}, { assumeVal: true });
}
exports.matchEq = matchEq;
function shallowCompareObj(obj1, obj2) {
    const plainObj = (0, merge_1.isPlainObject)(obj1);
    if (plainObj !== (0, merge_1.isPlainObject)(obj2)) {
        return false;
    }
    if (plainObj) {
        const obj1Keys = Object.keys(obj1);
        for (let i = 0; i < obj1Keys.length; i++) {
            const key = obj1Keys[i];
            const obj1Val = obj1[key];
            const obj2Val = obj2[key];
            if ((obj1Val !== obj2Val) && (!['object', 'function'].includes(typeof obj1Val) || !['object', 'function'].includes(typeof obj2Val))) {
                return false;
            }
        }
        return true;
    }
    if (obj1.length !== obj2.length) {
        return false;
    }
    for (let i = 0; i < obj1.length; i++) {
        const obj1Val = obj1[i];
        const obj2Val = obj2[i];
        if ((obj1Val !== obj2Val) && (!['object', 'function'].includes(typeof obj1Val) || !['object', 'function'].includes(typeof obj2Val))) {
            return false;
        }
    }
    return true;
}
exports.shallowCompareObj = shallowCompareObj;
