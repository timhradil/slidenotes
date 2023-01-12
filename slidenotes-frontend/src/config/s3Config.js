const s3Config = {
  bucketName: process.env.REACT_APP_PPTX_S3_NAME,
  region: process.env.REACT_APP_PPTX_S3_REGION,
  accessKeyId: process.env.REACT_APP_PPTX_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_PPTX_S3_SECRET_ACCESS_KEY,
}

export default s3Config
