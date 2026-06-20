import type { AppEvent } from "@repo/types";

export async function dispatchEvent(queue: Queue<AppEvent>, event: AppEvent): Promise<void> {
	try {
		await queue.send(event);
	} catch (err) {
		console.error(`Failed to dispatch event ${event.type}:`, err);
	}
}
