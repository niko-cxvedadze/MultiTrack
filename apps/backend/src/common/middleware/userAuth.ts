import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";
import { createAdminDb } from "@/common/lib/adminDb";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { AppEnv } from "@/env";

export const userAuth = async (c: Context<AppEnv>, next: Next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		const response = ServiceResponse.failure("Missing or invalid token", null, StatusCodes.UNAUTHORIZED);
		return c.json(response, StatusCodes.UNAUTHORIZED);
	}

	try {
		const token = authHeader.split(" ")[1];
		const adminDb = createAdminDb(c.env);
		const user = await adminDb.auth.verifyToken(token);
		c.set("user", { id: user.id, email: user.email ?? undefined });
		c.set("adminDb", adminDb);
		await next();
	} catch {
		const response = ServiceResponse.failure("Invalid or expired token", null, StatusCodes.UNAUTHORIZED);
		return c.json(response, StatusCodes.UNAUTHORIZED);
	}
};
