/**
 * Base email layout wrapper — all email templates should use this.
 * Provides consistent header (MultiTrack branding), body container, and footer.
 */
export function emailLayout(body: string): string {
	const year = new Date().getFullYear();

	return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:600px;width:100%">
          <!-- Header -->
          <tr>
            <td style="background:#822ef5;padding:24px 32px">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px">MULTITRACK</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 32px;background:#fafafa;text-align:center">
              <p style="margin:0 0 4px;font-size:12px;color:#999">&copy; ${year} MultiTrack. ყველა უფლება დაცულია.</p>
              <p style="margin:0;font-size:12px;color:#bbb">&copy; ${year} MultiTrack. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
