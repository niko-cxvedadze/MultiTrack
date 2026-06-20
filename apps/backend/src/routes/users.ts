import type { PaginationQuery } from "@repo/types";
import { GetUsersInputValidator, GetUsersOutputValidator } from "@repo/types";
import { Hono } from "hono";

import { validateRequest, validateResponse } from "@/common/utils/httpHandlers";
import { createDeps } from "@/deps";
import type { AppEnv, ContentfulStatusCode } from "@/env";

const users = new Hono<AppEnv>();

users.get("/", validateRequest(GetUsersInputValidator), async (c) => {
	const { limit, offset } = c.get("validatedQuery") as PaginationQuery;
	const { userStore } = createDeps(c.env);

	const [items, total] = await Promise.all([userStore.findPaginated(limit, offset), userStore.count()]);

	const response = { success: true, responseObject: { items, total, limit, offset }, statusCode: 200 };
	const validated = validateResponse(GetUsersOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

users.get("/:id", async (c) => {
	const userId = c.req.param("id");
	const { userStore } = createDeps(c.env);
	const user = await userStore.findByIdWithDetails(userId);
	if (!user) {
		return c.json({ success: false, message: "User not found", statusCode: 404 }, 404 as ContentfulStatusCode);
	}
	return c.json({ success: true, responseObject: user, statusCode: 200 }, 200 as ContentfulStatusCode);
});

export { users };
