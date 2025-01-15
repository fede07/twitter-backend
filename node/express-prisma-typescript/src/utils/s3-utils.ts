import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import * as process from 'node:process';

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
  }
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET

export const generatePresignedUrl = async (key: string, contentType: string): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })

  console.log('Bucket:', process.env.AWS_S3_BUCKET);
  console.log('Key:', key);
  console.log('ContentType:', contentType);

  return await getSignedUrl(s3, command, { expiresIn: 3600 })
}

export const getPublicUrl = (key: string): string => {
  const bucketName = process.env.AWS_S3_BUCKET;
  const region = process.env.AWS_REGION;

  return `https://${bucketName}.s3.${region}.amazonaws.com/${key}`;
};
