"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
class Task {
    constructor(times, eventName, cmd) {
        this.times = times;
        this.event = eventName;
        this.cmd = cmd;
        this.name = times + '_' + eventName;
    }
    times;
    event;
    cmd;
    name;
}
exports.Task = Task;
