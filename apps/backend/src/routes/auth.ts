import {
	CheckExistsInputValidator,
	CheckExistsOutputValidator,
	RegisterInputValidator,
	RegisterOutputValidator,
	SendCodeInputValidator,
	SendCodeOutputValidator,
	SendEmailCodeInputValidator,
	SendEmailCodeOutputValidator,
	VerifyCodeInputValidator,
	VerifyCodeOutputValidator,
	VerifyEmailCodeInputValidator,
	VerifyEmailCodeOutputValidator,
} from "@repo/types";
import { Hono } from "hono";
import { rateLimitOtp } from "@/common/middleware/rateLimitOtp";
import { validateRequest, validateResponse } from "@/common/utils/httpHandlers";
import { createDeps } from "@/deps";
import type { AppEnv, ContentfulStatusCode } from "@/env";

const auth = new Hono<AppEnv>();

auth.post("/check-exists", validateRequest(CheckExistsInputValidator), async (c) => {
	const body = c.get("validatedBody");
	const { authService } = createDeps(c.env);
	const response = await authService.checkExists(body.phoneNumber, body.email);
	const validated = validateResponse(CheckExistsOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

auth.post("/send-code", rateLimitOtp, validateRequest(SendCodeInputValidator), async (c) => {
	const body = c.get("validatedBody");
	const { authService } = createDeps(c.env);
	const response = await authService.sendVerificationCode(body.phoneNumber, body.purpose);
	const validated = validateResponse(SendCodeOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

auth.post("/verify-code", validateRequest(VerifyCodeInputValidator), async (c) => {
	const body = c.get("validatedBody");
	const { authService } = createDeps(c.env);
	const response = await authService.verifyCodeAndSignIn(body.phoneNumber, body.code);
	const validated = validateResponse(VerifyCodeOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

auth.post("/register", validateRequest(RegisterInputValidator), async (c) => {
	const body = c.get("validatedBody");
	const { authService } = createDeps(c.env);
	const response = await authService.register(
		body.phoneNumber,
		body.code,
		body.email,
		body.firstName,
		body.lastName,
		body.newsletterSubscribed,
	);
	const validated = validateResponse(RegisterOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

auth.post("/send-email-code", rateLimitOtp, validateRequest(SendEmailCodeInputValidator), async (c) => {
	const body = c.get("validatedBody");
	const { authService } = createDeps(c.env);
	const response = await authService.sendEmailCode(body.email);
	const validated = validateResponse(SendEmailCodeOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

auth.post("/verify-email-code", validateRequest(VerifyEmailCodeInputValidator), async (c) => {
	const body = c.get("validatedBody");
	const { authService } = createDeps(c.env);
	const response = await authService.verifyEmailCodeAndSignIn(body.email, body.code);
	const validated = validateResponse(VerifyEmailCodeOutputValidator, response);
	return c.json(validated, validated.statusCode as ContentfulStatusCode);
});

export { auth };
