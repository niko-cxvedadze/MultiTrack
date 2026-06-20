import { emailLayout } from "./layout";

export interface VerificationCodeData {
	code: string;
}

export function verificationCodeSubject(): string {
	return "ვერიფიკაციის კოდი / Verification Code — MultiTrack";
}

export function verificationCodeHtml(data: VerificationCodeData): string {
	const { code } = data;

	const body = `
    <!-- Georgian -->
    <h2 style="margin:0 0 4px;font-size:20px;color:#1a1a1a">შესვლის კოდი</h2>
    <p style="margin:0 0 4px;font-size:14px;color:#666">გამოიყენეთ ქვემოთ მოცემული კოდი ანგარიშში შესასვლელად.</p>

    <!-- English -->
    <p style="margin:0 0 24px;font-size:14px;color:#999">Use the code below to sign in to your account.</p>

    <!-- Code -->
    <table width="100%" style="margin-bottom:24px" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:24px 0">
          <div style="display:inline-block;background:#fafafa;border:2px solid #e5e5e5;border-radius:8px;padding:16px 40px;font-size:32px;font-weight:800;letter-spacing:8px;color:#822ef5">${code}</div>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 4px;font-size:13px;color:#666">ამ კოდის მოქმედების ვადა იწურება 10 წუთში.</p>
    <p style="margin:0 0 24px;font-size:13px;color:#999">This code expires in 10 minutes.</p>

    <p style="margin:0;font-size:13px;color:#999;text-align:center">
      თუ თქვენ არ მოითხოვეთ ეს კოდი, იგნორირება გაუკეთეთ ამ წერილს.<br/>
      If you didn't request this code, please ignore this email.
    </p>`;

	return emailLayout(body);
}
