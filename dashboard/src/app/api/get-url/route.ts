import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
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
    const { key } = await request.json();

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(R2, command, { expiresIn: 3600 });

    return Response.json({
      success: true,
      url: signedUrl,
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return Response.json(
      { success: false, error: "Failed to generate signed URL" },
      { status: 500 }
    );
  }
} 