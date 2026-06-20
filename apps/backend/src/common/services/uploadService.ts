import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { buildR2Key, IMMUTABLE_CACHE_CONTROL } from "@repo/types";

import type { Env } from "@/env";

interface PresignedUploadResult {
	uploadUrl: string;
	key: string;
	publicUrl: string;
}

export class UploadService {
	private env: Env;
	private r2Client: S3Client;

	constructor(env: Env) {
		this.env = env;
		this.r2Client = new S3Client({
			region: "auto",
			endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: env.R2_ACCESS_KEY_ID,
				secretAccessKey: env.R2_SECRET_ACCESS_KEY,
			},
		});
	}

	async getPresignedUploadUrl(contentType: string, folder: string, fileName?: string): Promise<PresignedUploadResult> {
		const key = buildR2Key({ folder, contentType, fileName });

		const command = new PutObjectCommand({
			Bucket: this.env.R2_BUCKET_NAME,
			Key: key,
			ContentType: contentType,
			CacheControl: IMMUTABLE_CACHE_CONTROL,
		});

		const uploadUrl = await getSignedUrl(this.r2Client, command, { expiresIn: 600 });
		const publicUrl = `${this.env.R2_PUBLIC_URL}/${key}`;

		return { uploadUrl, key, publicUrl };
	}

	async deleteObject(key: string): Promise<void> {
		await this.env.R2_BUCKET.delete(key);
	}
}
