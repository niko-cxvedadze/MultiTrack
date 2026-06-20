import type { AppEvent } from "@repo/types";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type Env = {
	// Secrets
	INSTANT_APP_ID: string;
	INSTANT_APP_ADMIN_TOKEN: string;
	JWT_SECRET: string;
	SMS_API_KEY: string;
	RESEND_API_KEY: string;
	ADMIN_EMAIL: string;
	ADMIN_PASSWORD_HASH: string;
	CORS_ORIGIN: string;
	R2_PUBLIC_URL: string;
	// For presigned URLs (keep for now)
	R2_ACCOUNT_ID: string;
	R2_ACCESS_KEY_ID: string;
	R2_SECRET_ACCESS_KEY: string;
	R2_BUCKET_NAME: string;
	// R2 Binding
	R2_BUCKET: R2Bucket;
	// Rate Limiting
	OTP_RATE_LIMITER: RateLimit;
	ADMIN_LOGIN_RATE_LIMITER: RateLimit;
	// Queues
	EVENTS_QUEUE: Queue<AppEvent>;
};

export type AppEnv = {
	Bindings: Env;
	Variables: {
		admin: { email: string; role: string };
		user: { id: string; email?: string };
		adminDb: import("./common/lib/adminDb").AdminDb;
	};
};

export type { ContentfulStatusCode };
