import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configuration for R2 client
const R2_ACCOUNT_ID = process.env.NEXT_PUBLIC_R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

// Check if R2 is configured
const isR2Configured = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);

// This is here in case we want to add more upload options in the future
// Uploads are disabled if none of the upload options are available
export const isUploadsEnabled = process.env.NEXT_PUBLIC_UPLOADS_ENABLED === "true";

interface UploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

// Initialize S3 client for R2 only if configured
const s3Client = isR2Configured
    ? new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: R2_ACCESS_KEY_ID,
            secretAccessKey: R2_SECRET_ACCESS_KEY,
        },
    })
    : null;

/**
 * Uploads a file to Cloudflare R2
 * @param file - The file to upload (Buffer or Blob)
 * @param fileName - The name to give the file in R2
 * @param contentType - The MIME type of the file
 * @returns Promise<UploadResult>
 */
export async function uploadToR2(
    file: Buffer | Blob,
    fileName: string,
    contentType: string,
    folderPath?: string
): Promise<UploadResult> {
    if (!isR2Configured || !s3Client) {
        return {
            success: false,
            error: "R2 storage is not configured. Please check your environment variables.",
        };
    }

    try {
        // Convert Blob to Buffer if necessary
        const fileBuffer = file instanceof Blob ? Buffer.from(await file.arrayBuffer()) : file;

        // Create unique file name to prevent collisions
        const uniqueFileName = `${folderPath ? `${folderPath}/` : ""}${Date.now()}-${fileName}`;

        // Upload to R2
        await s3Client.send(
            new PutObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: uniqueFileName,
                Body: fileBuffer,
                ContentType: contentType,
            })
        );

        // Generate the public URL
        const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${uniqueFileName}`;

        return {
            success: true,
            url: publicUrl,
        };
    } catch (error) {
        console.error("Error uploading to R2:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred during upload",
        };
    }
}

/**
 * Validates file before upload
 * @param file - The file to validate
 * @param maxSizeInMB - Maximum file size in MB
 * @param allowedTypes - Array of allowed MIME types
 * @returns boolean
 */
export function validateFile(
    file: File,
    maxSizeInMB: number,
    allowedTypes: string[]
): { isValid: boolean; error?: string } {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

    if (file.size > maxSizeInBytes) {
        return {
            isValid: false,
            error: `File size exceeds ${maxSizeInMB}MB limit`,
        };
    }

    if (!allowedTypes.includes(file.type)) {
        return {
            isValid: false,
            error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(", ")}`,
        };
    }

    return { isValid: true };
}
