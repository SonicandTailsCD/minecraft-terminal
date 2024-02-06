"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logicExp = void 0;
const index_js_1 = require("./utils/strings/index.js");
function parse(str) {
    let strCopy = str.toLowerCase().replace(/\s/g, '');
    const evaluate = (ops, andOr = '&') => {
        for (const op of ops) {
            const [bef, af] = op.split(andOr);
            if (bef === af) {
                if (bef === 'true') {
                    strCopy = strCopy.replace(op, 'true');
                    continue;
                }
                if (bef === 'false') {
                    strCopy = strCopy.replace(op, 'false');
                    continue;
                }
            }
            if (bef === 'true' || af === 'true') {
                if (andOr === '|') {
                    strCopy = strCopy.replace(op, 'true');
                    continue;
                }
                if (andOr === '&') {
                    strCopy = strCopy.replace(op, 'false');
                    continue;
                }
            }
            strCopy = strCopy.replace(op, 'false');
        }
    };
    let oldStr = '';
    while (oldStr !== strCopy) {
        oldStr = strCopy.valueOf();
        const andOps = strCopy.match(/[^()&|]+&[^()&|]+/g);
        if (andOps != null) {
            evaluate(andOps, '&');
        }
        const orOps = strCopy.match(/[^()&|]+\|[^()&|]+/g);
        if (orOps != null) {
            evaluate(orOps, '|');
        }
        const pars = strCopy.match(/(?<=\()[^()&|]+(?=\))/g);
        if (pars != null) {
            for (const par of pars) {
                strCopy = strCopy.replace(`(${par})`, par);
            }
        }
    }
    if (strCopy === 'false') {
        return false;
    }
    if (strCopy === 'true') {
        return true;
    }
    throw new Error('Invalid input');
}
function logicExp(str, values, options) {
    options = Object.assign({
        safe: true,
        assumeVal: false
    }, options);
    if (values) {
        for (const valKey of Object.keys(values)) {
            str = str.replace(new RegExp(`((?<=[&|])|^)${(0, index_js_1.escapeRegExp)(valKey)}`), values[valKey]);
        }
    }
    const allVals = str.match(/[^()&|]+/g);
    if (options.safe === true && (allVals != null)) {
        for (const val of allVals) {
            if (!['true', 'false'].includes(val)) {
                throw new Error('Value must be of type Boolean');
            }
        }
    }
    else if (allVals != null) {
        for (const val of allVals) {
            if (!['true', 'false'].includes(val)) {
                str = str.replace(val, String(options.assumeVal));
            }
        }
    }
    return parse(str);
}
exports.logicExp = logicExp;
