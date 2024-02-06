"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withPriority = exports.Priority = void 0;
const sleep_js_1 = require("../../helpers/sleep.js");
const isNumber_js_1 = require("../numbers/isNumber.js");
class Priority {
    priority = 0;
    cooldown = 0;
}
exports.Priority = Priority;
async function withPriority(priority = 0, cooldown = 0, doIfOnCooldown = true, countSamePriority = false, cache = new Priority(), callback) {
    if (!(0, isNumber_js_1.isNumber)(cooldown)) {
        return;
    }
    let isOnCooldown = false;
    if (priority < cache.priority || (countSamePriority && priority <= cache.priority)) {
        const sleepTime = cache.cooldown - Date.now();
        if (sleepTime > 0) {
            await (0, sleep_js_1.sleep)(sleepTime);
            isOnCooldown = true;
        }
    }
    if (!isOnCooldown || doIfOnCooldown) {
        await callback?.();
    }
    if (cache.cooldown < Date.now() + cooldown) {
        cache.priority = priority;
        cache.cooldown = Date.now() + cooldown;
    }
}
exports.withPriority = withPriority;
