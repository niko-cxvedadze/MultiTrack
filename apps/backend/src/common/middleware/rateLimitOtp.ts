import type { Context, Next } from "hono";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { AppEnv } from "@/env";

export const rateLimitOtp = async (c: Context<AppEnv>, next: Next) => {
	const body = await c.req.json().catch(() => ({}));
	const key = (body as Record<string, unknown>).phoneNumber ?? (body as Record<string, unknown>).email;

	if (!key || typeof key !== "string") {
		await next();
		return;
	}

	const limiter = c.env.OTP_RATE_LIMITER;
	const { success } = await limiter.limit({ key });

	if (!success) {
		const response = ServiceResponse.failure(
			"Too many requests. Please try again later.",
			null,
			StatusCodes.TOO_MANY_REQUESTS,
		);
		return c.json(response, StatusCodes.TOO_MANY_REQUESTS);
	}

	await next();
};
