import { OtpPurpose } from "@repo/types";
import { StatusCodes } from "http-status-codes";
import type { AdminDb } from "@/common/lib/adminDb";
import { ServiceResponse } from "@/common/models/serviceResponse";
import type { OTPService } from "@/common/services/otpService";
import type { SMSService } from "@/common/services/smsService";
import type { UserStore } from "@/stores/userStore";

export class AuthService {
	constructor(
		private userStore: UserStore,
		private otpService: OTPService,
		private smsService: SMSService,
		private adminDb: AdminDb,
	) {}

	async register(
		phoneNumber: string,
		code: string,
		email: string,
		firstName: string,
		lastName: string,
		newsletterSubscribed?: boolean,
	): Promise<ServiceResponse<{ token: string } | null>> {
		const verification = await this.otpService.verifyOTP(phoneNumber, code, OtpPurpose.Register);

		if (!verification.valid) {
			return ServiceResponse.failure("invalidCode", null, StatusCodes.BAD_REQUEST);
		}

		try {
			const existingByPhone = await this.userStore.findByPhoneNumber(phoneNumber);
			if (existingByPhone) {
				return ServiceResponse.failure("phoneAlreadyRegistered", null, StatusCodes.CONFLICT);
			}

			const existingByEmail = await this.userStore.findByEmail(email);
			if (existingByEmail) {
				return ServiceResponse.failure("emailAlreadyRegistered", null, StatusCodes.CONFLICT);
			}

			const fullName = `${firstName} ${lastName}`.trim();
			const userId = await this.userStore.create({
				phoneNumber,
				email,
				fullName,
				newsletterSubscribed: newsletterSubscribed ?? false,
			});

			const token = await this.userStore.createAuthToken(userId);

			return ServiceResponse.success("Registration successful", { token }, StatusCodes.CREATED);
		} catch (_error) {
			return ServiceResponse.failure("registerFailed", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async checkExists(
		phoneNumber?: string,
		email?: string,
	): Promise<ServiceResponse<{ phoneExists: boolean; emailExists: boolean } | null>> {
		try {
			const phoneExists = phoneNumber ? !!(await this.userStore.findByPhoneNumber(phoneNumber)) : false;
			const emailExists = email ? !!(await this.userStore.findByEmail(email)) : false;

			return ServiceResponse.success("Check complete", { phoneExists, emailExists }, StatusCodes.OK);
		} catch (_error) {
			return ServiceResponse.failure("checkFailed", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async sendVerificationCode(
		phoneNumber: string,
		purpose: OtpPurpose,
	): Promise<ServiceResponse<{ message: string } | null>> {
		try {
			const existingUser = await this.userStore.findByPhoneNumber(phoneNumber);

			if (purpose === OtpPurpose.Login && !existingUser) {
				return ServiceResponse.failure("noAccountPhone", null, StatusCodes.NOT_FOUND);
			}

			if (purpose === OtpPurpose.Register && existingUser) {
				return ServiceResponse.failure("phoneAlreadyRegistered", null, StatusCodes.CONFLICT);
			}

			const code = await this.otpService.generateOTP(phoneNumber, purpose);

			const message = `Your MultiTrack verification code is: ${code}`;
			await this.smsService.sendSMS(phoneNumber, message);

			return ServiceResponse.success(
				"Verification code sent successfully",
				{ message: "Verification code sent to your phone number" },
				StatusCodes.OK,
			);
		} catch (_error) {
			return ServiceResponse.failure("sendCodeFailed", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async verifyCodeAndSignIn(phoneNumber: string, code: string): Promise<ServiceResponse<{ token: string } | null>> {
		const verification = await this.otpService.verifyOTP(phoneNumber, code, OtpPurpose.Login);

		if (!verification.valid) {
			return ServiceResponse.failure("invalidCode", null, StatusCodes.BAD_REQUEST);
		}

		try {
			const existingUser = await this.userStore.findByPhoneNumber(phoneNumber);

			if (!existingUser) {
				return ServiceResponse.failure("noAccountPhone", null, StatusCodes.NOT_FOUND);
			}

			const token = await this.userStore.createAuthToken(existingUser.id);

			return ServiceResponse.success("Authentication successful", { token }, StatusCodes.OK);
		} catch (_error) {
			return ServiceResponse.failure("verifyCodeFailed", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async sendEmailCode(email: string): Promise<ServiceResponse<{ message: string } | null>> {
		try {
			const existingUser = await this.userStore.findByEmail(email);

			if (!existingUser) {
				return ServiceResponse.failure("noAccountEmail", null, StatusCodes.NOT_FOUND);
			}

			await this.adminDb.auth.sendMagicCode(email);

			return ServiceResponse.success(
				"Verification code sent successfully",
				{ message: "Verification code sent to your email" },
				StatusCodes.OK,
			);
		} catch (_error) {
			return ServiceResponse.failure("sendCodeFailed", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}

	async verifyEmailCodeAndSignIn(email: string, code: string): Promise<ServiceResponse<{ token: string } | null>> {
		try {
			const existingUser = await this.userStore.findByEmail(email);

			if (!existingUser) {
				return ServiceResponse.failure("noAccountEmail", null, StatusCodes.NOT_FOUND);
			}

			let user: Awaited<ReturnType<typeof this.adminDb.auth.verifyMagicCode>> | null = null;
			try {
				user = await this.adminDb.auth.verifyMagicCode(email, code);
			} catch {
				return ServiceResponse.failure("invalidCode", null, StatusCodes.BAD_REQUEST);
			}

			if (!user) {
				return ServiceResponse.failure("invalidCode", null, StatusCodes.BAD_REQUEST);
			}

			const token = await this.userStore.createAuthToken(existingUser.id);

			return ServiceResponse.success("Authentication successful", { token }, StatusCodes.OK);
		} catch (_error) {
			return ServiceResponse.failure("verifyCodeFailed", null, StatusCodes.INTERNAL_SERVER_ERROR);
		}
	}
}
