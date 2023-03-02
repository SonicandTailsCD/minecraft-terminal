"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.mod = void 0;
var ResEdit = require("resedit");
var fs_1 = require("fs");
// Language code for en-us and encoding codepage for UTF-16
var language = {
    lang: 1033,
    codepage: 1200 // UTF-16
};
/**
 * Modify an exe file's metadata
 * @param {Options} options
 * @returns {void}
 */
function mod(options) {
    // Modify .exe w/ ResEdit
    var data = (0, fs_1.readFileSync)(options.file);
    var executable = ResEdit.NtExecutable.from(data);
    var res = ResEdit.NtExecutableResource.from(executable);
    var vi = ResEdit.Resource.VersionInfo.fromEntries(res.entries)[0];
    // Remove original filename
    vi.removeStringValue(language, 'OriginalFilename');
    vi.removeStringValue(language, 'InternalName');
    // Product version
    if (options.version) {
        // Convert version to tuple of 3 numbers
        var version = options.version
            .split('.')
            .map(function (v) { return Number(v) || 0; })
            .slice(0, 3);
        // Update versions
        vi.setProductVersion.apply(vi, __spreadArray(__spreadArray([], version, false), [0, language.lang], false));
        vi.setFileVersion.apply(vi, __spreadArray(__spreadArray([], version, false), [0, language.lang], false));
    }
    // Add additional user specified properties
    if (options.properties) {
        vi.setStringValues(language, options.properties);
    }
    vi.outputToResourceEntries(res.entries);
    // Add icon
    if (options.icon) {
        var iconFile = ResEdit.Data.IconFile.from((0, fs_1.readFileSync)(options.icon));
        ResEdit.Resource.IconGroupEntry.replaceIconsForResource(res.entries, 1, language.lang, iconFile.icons.map(function (item) { return item.data; }));
    }
    // Regenerate and write to .exe
    res.outputResource(executable);
    (0, fs_1.writeFileSync)(options.out, Buffer.from(executable.generate()));
}
exports.mod = mod;
