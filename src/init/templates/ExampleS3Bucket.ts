import { S3Bucket } from "../cloud-types/S3Bucket";

export const ExampleS3Bucket = S3Bucket.defineNew({
  bucketLabel: 'ExampleS3Bucket',
  extraProperties: {
    // Additional CloudFormation properties can be specified in here.
  },
});