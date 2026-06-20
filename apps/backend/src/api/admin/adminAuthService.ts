import type { AdminJwtPayload } from "@repo/types";
import { AdminJwtPayloadSchema } from "@repo/types";
import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import { jwtVerify, SignJWT } from "jose";

import { ServiceResponse } from "@/common/models/serviceResponse";
import type { Env } from "@/env";

const JWT_EXPIRES_IN = "7d";

export class AdminAuthService {
	private secret: Uint8Array;
	private env: Env;

	constructor(env: Env) {
		this.env = env;
		this.secret = new TextEncoder().encode(env.JWT_SECRET);
	}

	async login(email: string, password: string): Promise<ServiceResponse<{ token: string } | null>> {
		if (email !== this.env.ADMIN_EMAIL) {
			return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
		}

		const isValidPassword = await bcrypt.compare(password, this.env.ADMIN_PASSWORD_HASH);

		if (!isValidPassword) {
			return ServiceResponse.failure("Invalid credentials", null, StatusCodes.UNAUTHORIZED);
		}

		const token = await new SignJWT({ email, role: "admin" })
			.setProtectedHeader({ alg: "HS256" })
			.setExpirationTime(JWT_EXPIRES_IN)
			.sign(this.secret);

		return ServiceResponse.success("Login successful", { token }, StatusCodes.OK);
	}

	async verifyToken(token: string): Promise<AdminJwtPayload | null> {
		try {
			const { payload } = await jwtVerify(token, this.secret);
			const parsed = AdminJwtPayloadSchema.safeParse(payload);
			return parsed.success ? parsed.data : null;
		} catch {
			return null;
		}
	}
}
