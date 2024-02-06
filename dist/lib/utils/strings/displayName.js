"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayName = void 0;
const path_1 = require("path");
function displayName(path) {
    const m = (0, path_1.basename)(path).match(/^.+(?=\.)|.+/);
    if (m) {
        return m[0];
    }
    return '';
}
exports.displayName = displayName;
