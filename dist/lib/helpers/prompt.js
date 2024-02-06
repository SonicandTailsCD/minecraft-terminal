"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prompt = exports.setInterface = void 0;
let rlInterface;
function setInterface(int) {
    rlInterface = int;
}
exports.setInterface = setInterface;
async function prompt(query) {
    return await new Promise((resolve) => { rlInterface.question(query, resolve); });
}
exports.prompt = prompt;
