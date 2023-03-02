export type Task<T, Args extends unknown[]> = (...args: Args) => Promise<T> | T;

/**
 * Represents a queue of tasks to be executed in sequence.
 */
export class TaskQueue {
	/**
   * The array of tasks to be executed.
   */
	private readonly tasks: Array<Task<unknown, unknown[]>> = [];

	/**
   * Flag indicating whether tasks are currently being executed.
   */
	private isProcessing = false;

	/**
   * Adds a task to the queue and returns a promise that resolves to the output of the task function.
   * If the queue is currently processing tasks, the task is added to the end of the queue and
   * will be executed when all previous tasks have completed.
   * @param task - The task function to execute.
   * @param args - The arguments to pass to the task function.
   * @returns A promise that resolves to the output of the task function.
   */
	async add<T, Args extends unknown[]>(task: Task<T, Args>, ...args: Args): Promise<T> {
		const taskPromise = new Promise<T>((resolve) => {
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

	/**
   * Runs all tasks in the queue in sequence.
   * Tasks are executed in the order they were added to the queue.
   * This method should not be called directly; it is called automatically by the `addTask` method
   * when there are tasks to be executed.
   */
	private async processTasks (): Promise<void> {
		this.isProcessing = true;
		while (this.tasks.length > 0) {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			const task = this.tasks.shift()!;
			await task();
		}
		this.isProcessing = false;
	}
}
