import { UpdateFullNameInputValidator, UpdateNewsletterInputValidator } from "@repo/types";
import { Hono } from "hono";
import { validateRequest } from "@/common/utils/httpHandlers";
import { createDeps } from "@/deps";
import type { AppEnv, ContentfulStatusCode } from "@/env";

const me = new Hono<AppEnv>();

me.put("/full-name", validateRequest(UpdateFullNameInputValidator), async (c) => {
	const user = c.get("user");
	const { fullName } = c.get("validatedBody");
	const { profileService } = createDeps(c.env, c.get("adminDb"));
	const response = await profileService.updateFullName(user.id, fullName);
	return c.json(response, response.statusCode as ContentfulStatusCode);
});

me.put("/newsletter", validateRequest(UpdateNewsletterInputValidator), async (c) => {
	const user = c.get("user");
	const { newsletterSubscribed } = c.get("validatedBody");
	const { profileService } = createDeps(c.env, c.get("adminDb"));
	const response = await profileService.updateNewsletter(user.id, newsletterSubscribed);
	return c.json(response, response.statusCode as ContentfulStatusCode);
});

export { me };
