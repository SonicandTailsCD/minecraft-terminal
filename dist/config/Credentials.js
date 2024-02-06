"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Credentials = void 0;
class Credentials {
    auth = '';
    username = '';
    password = '';
    server = '';
    version = '';
    constructor(options) {
        Object.assign(this, options);
    }
}
exports.Credentials = Credentials;
