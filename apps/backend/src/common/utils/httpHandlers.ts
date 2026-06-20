import { createMiddleware } from "hono/factory";
import { StatusCodes } from "http-status-codes";
import { first } from "lodash-es";
import type { ZodError, ZodType, z } from "zod";

import { ServiceResponse } from "@/common/models/serviceResponse";

type InferBody<T extends ZodType> = z.infer<T> extends { body: infer B } ? B : never;
type InferQuery<T extends ZodType> = z.infer<T> extends { query: infer Q } ? Q : never;

export const validateRequest = <T extends ZodType>(schema: T) =>
	createMiddleware<{ Variables: { validatedBody: InferBody<T>; validatedQuery: InferQuery<T> } }>(async (c, next) => {
		try {
			const body = await c.req.json().catch(() => ({}));
			const query = c.req.query();
			const params = c.req.param();
			const parsed = (await schema.parseAsync({ body, query, params })) as Record<string, unknown>;
			c.set("validatedBody", body as InferBody<T>);
			if (parsed.query) {
				c.set("validatedQuery", parsed.query as InferQuery<T>);
			}
			await next();
		} catch (err) {
			const zodError = err as ZodError;
			const errors = zodError.issues.map((e) => {
				const fieldPath = e.path.length > 0 ? e.path.join(".") : "root";
				return `${fieldPath}: ${e.message}`;
			});

			const errorMessage =
				errors.length === 1
					? `Invalid input: ${first(errors)}`
					: `Invalid input (${errors.length} errors): ${errors.join("; ")}`;

			const statusCode = StatusCodes.BAD_REQUEST;
			const serviceResponse = ServiceResponse.failure(errorMessage, null, statusCode);
			return c.json(serviceResponse, statusCode);
		}
	});

export const validateResponse = <T>(schema: ZodType<T>, data: unknown): T => {
	try {
		return schema.parse(data);
	} catch (err) {
		const zodError = err as ZodError;
		const errors = zodError.issues.map((e) => {
			const fieldPath = e.path.length > 0 ? e.path.join(".") : "root";
			return `${fieldPath}: ${e.message}`;
		});

		const errorMessage =
			errors.length === 1
				? `Invalid response: ${first(errors)}`
				: `Invalid response (${errors.length} errors): ${errors.join("; ")}`;

		throw new Error(errorMessage);
	}
};
