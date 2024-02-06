"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseCoords = void 0;
function parseCoords(str, position, fixed) {
    let match = str.match(/[-~.+\d]+ [-~.+\d]+ [-~.+\d]*/g);
    if (match === null) {
        match = str.match(/[-~.+\d]+ [-~.+\d]*/g);
    }
    if (match === null) {
        return str;
    }
    for (let i = 0; i < match.length; i++) {
        const out = match[i].replace(/ $/, '');
        if (out === '~') {
            match[i] = '';
        }
        else {
            match[i] = out;
        }
    }
    if (typeof position !== 'object') {
        position = { x: 0, y: 0, z: 0 };
    }
    let outCoords = '';
    let outCommand = str;
    const parse = (match, matchRegex, outr, matchReplaceRegex, pos) => {
        let out;
        const x = Number(match.match(matchRegex));
        if (fixed)
            out = Number((position[pos] + (x || 0)).toFixed(fixed));
        else
            out = position.x + (x || 0);
        return outr.replace(matchReplaceRegex, String(out));
    };
    for (let i = 0; i < match.length; i++) {
        if (match[i].match('~') == null) {
            continue;
        }
        outCoords = parse(match[i], /(?<=^~)[-.+\d]+/m, match[i], /^~[-.+\d]*/, 'x');
        outCoords = parse(match[i], /[-.+\d]+$/, outCoords, /~[-.+\d]*$/m, 'z');
        outCoords = parse(match[i], /(?<!^~)(?<=~)[-.+\d]+(?= )/, outCoords, /(?<= )~[-.+\d]*/, 'y');
        outCommand = outCommand.replace(match[i], outCoords);
    }
    return outCommand;
}
exports.parseCoords = parseCoords;
