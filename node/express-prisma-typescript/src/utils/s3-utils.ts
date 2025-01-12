import AWS from 'aws-sdk'

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? ''
  },
  region: process.env.AWS_REGION
})

const BUCKET_NAME = process.env.AWS_BUCKET_NAME

export const getPresignedUrl = async (key: string, type: string): Promise<string> => {
  const params = {
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: type,
    Expires: 60 * 5,
    ACL: 'public-read'
  }

  return await s3.getSignedUrlPromise('putObject', params)
}
