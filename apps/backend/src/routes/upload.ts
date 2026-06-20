import {
	ALLOWED_IMAGE_TYPES,
	ALLOWED_VIDEO_TYPES,
	DeleteImageInputValidator,
	PresignedUploadInputValidator,
} from "@repo/types";
import { Hono } from "hono";
import { StatusCodes } from "http-status-codes";

import { ServiceResponse } from "@/common/models/serviceResponse";
import { validateRequest } from "@/common/utils/httpHandlers";
import { createDeps } from "@/deps";
import type { AppEnv } from "@/env";

const upload = new Hono<AppEnv>();

upload.post("/presigned", validateRequest(PresignedUploadInputValidator), async (c) => {
	const body = c.get("validatedBody");

	const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES] as readonly string[];
	if (!allowedTypes.includes(body.contentType)) {
		const response = ServiceResponse.failure(
			"Invalid content type. Allowed: JPEG, PNG, WebP, GIF, SVG, MP4, WebM, MOV",
			null,
			StatusCodes.BAD_REQUEST,
		);
		return c.json(response, StatusCodes.BAD_REQUEST);
	}

	try {
		const { uploadService } = createDeps(c.env);
		const result = await uploadService.getPresignedUploadUrl(body.contentType, body.folder, body.fileName);
		const response = ServiceResponse.success("Presigned URL generated", result, StatusCodes.OK);
		return c.json(response, StatusCodes.OK);
	} catch (err) {
		const msg = err instanceof Error ? err.message : "Failed to generate presigned URL";
		const response = ServiceResponse.failure(msg, null, StatusCodes.INTERNAL_SERVER_ERROR);
		return c.json(response, StatusCodes.INTERNAL_SERVER_ERROR);
	}
});

upload.delete("/image", validateRequest(DeleteImageInputValidator), async (c) => {
	const body = c.get("validatedBody");

	try {
		const { uploadService } = createDeps(c.env);
		await uploadService.deleteObject(body.key);
		const response = ServiceResponse.success("Image deleted", { key: body.key }, StatusCodes.OK);
		return c.json(response, StatusCodes.OK);
	} catch (err) {
		const msg = err instanceof Error ? err.message : "Failed to delete image";
		const response = ServiceResponse.failure(msg, null, StatusCodes.INTERNAL_SERVER_ERROR);
		return c.json(response, StatusCodes.INTERNAL_SERVER_ERROR);
	}
});

/**
 * Proxy an R2 object — used by the admin image editor to bypass CDN CORS restrictions.
 * GET /admin/upload/proxy?key=products/abc/image.webp
 */
upload.get("/proxy", async (c) => {
	const key = c.req.query("key");
	if (!key) {
		const response = ServiceResponse.failure("Missing key parameter", null, StatusCodes.BAD_REQUEST);
		return c.json(response, StatusCodes.BAD_REQUEST);
	}

	try {
		const object = await c.env.R2_BUCKET.get(key);
		if (!object) {
			const response = ServiceResponse.failure("Object not found", null, StatusCodes.NOT_FOUND);
			return c.json(response, StatusCodes.NOT_FOUND);
		}

		return new Response(object.body, {
			headers: {
				"Content-Type": object.httpMetadata?.contentType || "application/octet-stream",
				"Cache-Control": "private, max-age=300",
			},
		});
	} catch {
		const response = ServiceResponse.failure("Failed to fetch object", null, StatusCodes.INTERNAL_SERVER_ERROR);
		return c.json(response, StatusCodes.INTERNAL_SERVER_ERROR);
	}
});

export { upload };
