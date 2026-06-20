import { type AppEvent, EventType } from "@repo/types";
import type { Env } from "@/env";

export async function handleEvent(event: AppEvent, _env: Env): Promise<void> {
	switch (event.type) {
		case EventType.Example:
			console.log("Handling example event:", event);
			break;
		default:
			console.warn("Unhandled event type:", event);
	}
}
