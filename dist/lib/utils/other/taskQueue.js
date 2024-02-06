"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskQueue = void 0;
class TaskQueue {
    tasks = [];
    isProcessing = false;
    async add(task, ...args) {
        const taskPromise = new Promise((resolve) => {
            this.tasks.push(async () => {
                const result = await task(...args);
                resolve(result);
            });
        });
        if (!this.isProcessing) {
            void this.processTasks();
        }
        return await taskPromise;
    }
    async processTasks() {
        this.isProcessing = true;
        while (this.tasks.length > 0) {
            const task = this.tasks.shift();
            await task();
        }
        this.isProcessing = false;
    }
}
exports.TaskQueue = TaskQueue;
