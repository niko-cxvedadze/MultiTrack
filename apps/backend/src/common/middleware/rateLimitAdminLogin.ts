import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { AppEnv } from "@/env";

export const rateLimitAdminLogin = async (c: Context<AppEnv>, next: Next) => {
	const ip = c.req.header("cf-connecting-ip") ?? c.req.header("x-forwarded-for") ?? "unknown";

	const limiter = c.env.ADMIN_LOGIN_RATE_LIMITER;
	const { success } = await limiter.limit({ key: `admin-login:${ip}` });

	if (!success) {
		const response = ServiceResponse.failure(
			"Too many login attempts. Please try again later.",
			null,
			StatusCodes.TOO_MANY_REQUESTS,
		);
		return c.json(response, StatusCodes.TOO_MANY_REQUESTS);
	}

	await next();
};
