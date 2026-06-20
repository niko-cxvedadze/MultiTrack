import { AdminJwtPayloadSchema } from "@repo/types";
import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";
import { jwtVerify } from "jose";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { AppEnv } from "@/env";

export const adminAuth = async (c: Context<AppEnv>, next: Next) => {
	const authHeader = c.req.header("Authorization");

	if (!authHeader?.startsWith("Bearer ")) {
		const response = ServiceResponse.failure("Missing or invalid token", null, StatusCodes.UNAUTHORIZED);
		return c.json(response, StatusCodes.UNAUTHORIZED);
	}

	try {
		const token = authHeader.split(" ")[1];
		const secret = new TextEncoder().encode(c.env.JWT_SECRET);
		const { payload } = await jwtVerify(token, secret);

		const parsed = AdminJwtPayloadSchema.safeParse(payload);
		if (!parsed.success || parsed.data.role !== "admin") {
			const response = ServiceResponse.failure("Invalid or expired token", null, StatusCodes.UNAUTHORIZED);
			return c.json(response, StatusCodes.UNAUTHORIZED);
		}

		c.set("admin", { email: parsed.data.email, role: parsed.data.role });
		await next();
	} catch {
		const response = ServiceResponse.failure("Invalid or expired token", null, StatusCodes.UNAUTHORIZED);
		return c.json(response, StatusCodes.UNAUTHORIZED);
	}
};
