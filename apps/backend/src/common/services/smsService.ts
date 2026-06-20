interface SMSResponse {
	data?: Array<{
		messageId: string;
		statusId: number;
		qnt: number;
	}>;
	message?: string;
}

export class SMSService {
	private apiKey: string;

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	async sendSMS(phoneNumber: string, message: string): Promise<SMSResponse> {
		const formattedPhone = this.formatPhoneNumber(phoneNumber);
		this.validatePhoneNumber(formattedPhone);

		const res = await fetch("https://sender.ge/api/send.php", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				apikey: this.apiKey,
				smsno: "2",
				destination: formattedPhone,
				content: message,
			}),
		});

		if (!res.ok) {
			throw new Error(`SMS API error: ${res.status}`);
		}

		const result = (await res.json()) as SMSResponse;
		return result;
	}

	private validatePhoneNumber(phoneNumber: string): void {
		if (!/^5[0-9]{8}$/.test(phoneNumber)) {
			throw new Error("Invalid Georgian mobile number format. Expected: 5xxxxxxxx");
		}
	}

	private formatPhoneNumber(phoneNumber: string): string {
		return phoneNumber.replace(/^(\+?995)?/, "");
	}
}
