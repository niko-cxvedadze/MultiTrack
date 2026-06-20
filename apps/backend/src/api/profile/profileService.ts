import { StatusCodes } from "http-status-codes";
import type { AdminDb } from "@/common/lib/adminDb";
import { ServiceResponse } from "@/common/models/serviceResponse";

export class ProfileService {
	constructor(private adminDb: AdminDb) {}

	async updateFullName(userId: string, fullName: string): Promise<ServiceResponse<null>> {
		await this.adminDb.transact(this.adminDb.tx.$users[userId].update({ fullName }));
		return ServiceResponse.success("Profile updated", null, StatusCodes.OK);
	}

	async updateNewsletter(userId: string, newsletterSubscribed: boolean): Promise<ServiceResponse<null>> {
		await this.adminDb.transact(this.adminDb.tx.$users[userId].update({ newsletterSubscribed }));
		return ServiceResponse.success("Newsletter preference updated", null, StatusCodes.OK);
	}
}
