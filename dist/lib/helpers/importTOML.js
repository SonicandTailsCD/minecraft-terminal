"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.importTOML = void 0;
const fs_1 = require("fs");
const toml_1 = require("@iarna/toml");
function importTOML(path) {
    (0, fs_1.accessSync)(path, fs_1.constants.F_OK);
    return (0, toml_1.parse)((0, fs_1.readFileSync)(path).toString());
}
exports.importTOML = importTOML;
