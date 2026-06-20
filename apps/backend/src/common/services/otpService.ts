import { randomInt } from "node:crypto";

import type { OTPStore } from "@/stores/otpStore";

export class OTPService {
	constructor(private otpStore: OTPStore) {}

	async generateOTP(identifier: string, purpose: string): Promise<string> {
		const code = randomInt(100000, 1000000).toString();

		await this.otpStore.upsert(identifier, code, purpose);

		this.otpStore.deleteExpired().catch(() => {
			// Silently ignore cleanup errors
		});

		return code;
	}

	async verifyOTP(
		identifier: string,
		code: string,
		expectedPurpose?: string,
	): Promise<{ valid: boolean; error?: string }> {
		const entry = await this.otpStore.findByIdentifier(identifier);

		if (!entry) {
			return {
				valid: false,
				error: "No verification code found. Please request a new code.",
			};
		}

		if (expectedPurpose && entry.purpose !== expectedPurpose) {
			return {
				valid: false,
				error: "Invalid verification code. Please request a new code.",
			};
		}

		if (this.otpStore.isExpired(entry.expiresAt)) {
			await this.otpStore.delete(entry.id);
			return {
				valid: false,
				error: "Verification code has expired. Please request a new code.",
			};
		}

		if (this.otpStore.hasExceededAttempts(entry.attempts)) {
			await this.otpStore.delete(entry.id);
			return {
				valid: false,
				error: "Too many failed attempts. Please request a new code.",
			};
		}

		if (entry.code !== code) {
			await this.otpStore.incrementAttempts(entry.id, entry.attempts);
			const remaining = this.otpStore.getRemainingAttempts(entry.attempts + 1);
			return {
				valid: false,
				error: `Invalid verification code. ${remaining} attempts remaining.`,
			};
		}

		await this.otpStore.delete(entry.id);
		return { valid: true };
	}
}
