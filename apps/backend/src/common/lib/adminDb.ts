import { init } from "@instantdb/admin";

import type { Env } from "@/env";
import schema from "../../../../../instant.schema";

export function createAdminDb(env: Env) {
	return init({
		appId: env.INSTANT_APP_ID,
		adminToken: env.INSTANT_APP_ADMIN_TOKEN,
		schema,
	});
}

export type AdminDb = ReturnType<typeof createAdminDb>;
