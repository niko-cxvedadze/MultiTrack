import { id } from "@instantdb/admin";
import type { OTPCode } from "@repo/types";
import { first } from "lodash-es";

import type { AdminDb } from "@/common/lib/adminDb";

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 3;

export class OTPStore {
	constructor(private adminDb: AdminDb) {}

	async findByIdentifier(identifier: string): Promise<OTPCode | null> {
		const { otpCodes } = await this.adminDb.query({
			otpCodes: { $: { where: { identifier } } },
		});
		return (first(otpCodes) as OTPCode) ?? null;
	}

	async create(identifier: string, code: string, purpose: string) {
		const otpId = id();
		const expiresAt = Date.now() + OTP_EXPIRY_MS;

		await this.adminDb.transact(
			this.adminDb.tx.otpCodes[otpId].update({
				identifier,
				code,
				expiresAt,
				attempts: 0,
				purpose,
			}),
		);

		return { id: otpId, code, expiresAt };
	}

	async upsert(identifier: string, code: string, purpose: string) {
		const existing = await this.findByIdentifier(identifier);

		if (existing) {
			await this.delete(existing.id);
		}

		return this.create(identifier, code, purpose);
	}

	async incrementAttempts(otpId: string, currentAttempts: number) {
		await this.adminDb.transact(this.adminDb.tx.otpCodes[otpId].update({ attempts: currentAttempts + 1 }));
	}

	async delete(otpId: string) {
		await this.adminDb.transact(this.adminDb.tx.otpCodes[otpId].delete());
	}

	async deleteExpired() {
		const now = Date.now();
		const { otpCodes } = await this.adminDb.query({
			otpCodes: { $: { where: { expiresAt: { $lt: now } } } },
		});

		if (otpCodes.length > 0) {
			const deleteTxs = otpCodes.map((otp) => this.adminDb.tx.otpCodes[otp.id].delete());
			await this.adminDb.transact(deleteTxs);
		}

		return otpCodes.length;
	}

	isExpired(expiresAt: number): boolean {
		return Date.now() > expiresAt;
	}

	hasExceededAttempts(attempts: number): boolean {
		return attempts >= MAX_ATTEMPTS;
	}

	getRemainingAttempts(attempts: number): number {
		return MAX_ATTEMPTS - attempts;
	}
}
