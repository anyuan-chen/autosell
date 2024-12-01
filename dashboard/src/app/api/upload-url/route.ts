import { SignedUrlResponse } from "@/types/storage";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const { filename, contentType, expiresIn } = await request.json();

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: `listings/${filename}`,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(R2, command, {
      expiresIn,
    });

    return Response.json({
      success: true,
      url: signedUrl,
      key: `listings/${filename}`,
    } as SignedUrlResponse);
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return Response.json(
      { success: false, error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
}
