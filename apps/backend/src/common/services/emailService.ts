import { Resend } from "resend";

interface SendEmailParams {
	to: string | string[];
	subject: string;
	html: string;
	from?: string;
}

interface SendEmailResult {
	id: string;
}

export class EmailService {
	private resend: Resend;

	constructor(apiKey: string) {
		this.resend = new Resend(apiKey);
	}

	async sendEmail({ to, subject, html, from }: SendEmailParams): Promise<SendEmailResult> {
		const { data, error } = await this.resend.emails.send({
			from: from ?? "MultiTrack <noreply@printa.ge>",
			to: Array.isArray(to) ? to : [to],
			subject,
			html,
		});

		if (error) {
			throw new Error(`Resend error: ${error.message}`);
		}

		if (!data) {
			throw new Error("Resend returned no data");
		}

		return { id: data.id };
	}
}
