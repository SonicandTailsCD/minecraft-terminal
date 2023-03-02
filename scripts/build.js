"use strict";
var _a;
exports.__esModule = true;
var fs_1 = require("fs");
var path_1 = require("path");
var editPkgExe_js_1 = require("./lib/editPkgExe.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
var _package = require('../package.json');
function getExeFromBuildDir(dir) {
    if (dir === void 0) { dir = '../builds'; }
    var files = (0, fs_1.readdirSync)(dir, { encoding: 'utf8' });
    var out = [];
    for (var _i = 0, files_1 = files; _i < files_1.length; _i++) {
        var val = files_1[_i];
        if (/\.exe$/.test(val)) {
            out.push((0, path_1.resolve)((0, path_1.join)(dir, val)));
        }
    }
    return out[0] ? out : null;
}
// Mod
{
    var filePath = (_a = getExeFromBuildDir((0, path_1.join)(__dirname, '..', 'builds'))) === null || _a === void 0 ? void 0 : _a[0];
    if (filePath) {
        (0, editPkgExe_js_1.mod)({
            file: filePath,
            out: "".concat(filePath, "-mod.exe"),
            version: _package.version,
            properties: {
                FileDescription: _package.description,
                ProductName: _package.name,
                CompanyName: '',
                LegalCopyright: ''
            }
        });
        process.stdout.write('Done.\n');
    }
    else {
        process.stderr.write('EXE file not found.\n');
    }
}
