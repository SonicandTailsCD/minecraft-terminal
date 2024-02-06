"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languages = exports.setLang = exports.currentLang = void 0;
const EN_js_1 = require("./EN.js");
exports.currentLang = new EN_js_1.EN();
function setLang(_lang, overrides) {
    exports.currentLang = new _lang(undefined, overrides);
}
exports.setLang = setLang;
exports.languages = {
    EN: EN_js_1.EN
};
