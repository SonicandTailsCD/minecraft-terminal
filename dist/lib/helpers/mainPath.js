"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainPath = exports.srcPath = void 0;
const path_1 = require("path");
exports.srcPath = (0, path_1.resolve)((0, path_1.join)(__dirname, '..', '..'));
exports.mainPath = (0, path_1.resolve)((0, path_1.join)(exports.srcPath, '..'));
