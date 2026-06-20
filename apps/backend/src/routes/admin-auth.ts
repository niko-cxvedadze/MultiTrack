import { AdminLoginInputValidator, AdminLoginOutputValidator, AdminMeOutputValidator } from "@repo/types";
import { Hono } from "hono";

import { adminAuth } from "@/common/middleware/adminAuth";
import { rateLimitAdminLogin } from "@/common/middleware/rateLimitAdminLogin";
import { validateRequest, validateResponse } from "@/common/utils/httpHandlers";
import { createDeps } from "@/deps";
import type { AppEnv, ContentfulStatusCode } from "@/env";

const adminAuthRoutes = new Hono<AppEnv>();

adminAuthRoutes.post("/login", rateLimitAdminLogin, validateRequest(AdminLoginInputValidator), async (c) => {
	const body = c.get("validatedBody");
	const { adminAuthService } = createDeps(c.env);
	const response = await adminAuthService.login(body.email, body.password);
	const validated = validateResponse(AdminLoginOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

adminAuthRoutes.get("/me", adminAuth, async (c) => {
	const admin = c.get("admin");
	const response = {
		success: true,
		message: "Authenticated",
		responseObject: { email: admin.email },
		statusCode: 200 as const,
	};
	const validated = validateResponse(AdminMeOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

export { adminAuthRoutes };
