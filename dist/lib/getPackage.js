"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPackage = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
async function getPackage(packageName) {
    const res = await (0, axios_1.default)({
        method: 'get',
        url: 'https://registry.npmjs.org/' + packageName + '/latest',
        responseType: 'text',
        responseEncoding: 'binary',
        headers: {
            'Accept-Encoding': 'raw'
        }
    });
    return JSON.parse(res.data);
}
exports.getPackage = getPackage;
