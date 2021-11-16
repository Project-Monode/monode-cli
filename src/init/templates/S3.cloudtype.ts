import { CloudType } from 'monode-serverless';
import * as AWS from 'aws-sdk';

/// This is how S3s will be defined
export const S3 = CloudType.defineNew({
  cloudTypeName: 's3',
  defineNew(args: {
    bucketLabel: string
  }) {
    const bucketName = `multi-compile-sandbox-dev-${args.bucketLabel}`;
    return {
      cloudFormationExports: {
        functions: { },
        resources: {
          [args.bucketLabel]: {
            "Type": "AWS::S3::Bucket",
            "Properties":{
              "BucketName": bucketName,
              "AccessControl": "Private",
            },
          },
        },
      },

      getObject: async function(args: { filePath: string }) {
        const s3 = new AWS.S3();
        return await (s3.getObject({
          Bucket: bucketName, 
          Key: args.filePath,
         }).promise());
      },

      putObject: async function(args: { filePath: string, data: BinaryData | string }) {
        const s3 = new AWS.S3();
        return await (s3.putObject({
          Body: args.data,
          Bucket: bucketName,
          Key: args.filePath,
        }).promise());
      },
    };
  }
});