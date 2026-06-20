import { id } from "@instantdb/admin";
import { first } from "lodash-es";

import type { AdminDb } from "@/common/lib/adminDb";

export class UserStore {
	constructor(private adminDb: AdminDb) {}

	async findByPhoneNumber(phoneNumber: string) {
		const { $users } = await this.adminDb.query({
			$users: { $: { where: { phoneNumber } } },
		});
		return first($users) ?? null;
	}

	async findByEmail(email: string) {
		const { $users } = await this.adminDb.query({
			$users: { $: { where: { email } } },
		});
		return first($users) ?? null;
	}

	async findById(userId: string) {
		const { $users } = await this.adminDb.query({
			$users: { $: { where: { id: userId } } },
		});
		return first($users) ?? null;
	}

	async findAll() {
		const { $users } = await this.adminDb.query({ $users: {} });
		return $users;
	}

	async findPaginated(limit: number, offset: number) {
		const { $users } = await this.adminDb.query({
			$users: { $: { limit, offset } },
		});
		return $users;
	}

	async count() {
		const { $users } = await this.adminDb.query({ $users: {} });
		return $users.length;
	}

	async findByIdWithDetails(userId: string) {
		const { $users } = await this.adminDb.query({
			$users: { $: { where: { id: userId } } },
		});
		return first($users) ?? null;
	}

	async create(data: { phoneNumber: string; email?: string; fullName?: string; newsletterSubscribed?: boolean }) {
		const userId = id();
		await this.adminDb.transact(this.adminDb.tx.$users[userId].update(data));
		return userId;
	}

	async createAuthToken(userId: string) {
		return this.adminDb.auth.createToken({ id: userId });
	}
}
