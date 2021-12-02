import { CloudComponentType, buildResourceName, CloudComponent, defineResourceInteraction } from 'monode-serverless';
import * as AWS from 'aws-sdk';

/// This is how S3s will be defined
export const S3 = CloudComponentType.defineNew({
  defineNew(args: {
    bucketLabel: string,
    extraProperties: { [key: string]: any },
  }) {
    const bucketName = buildResourceName(args.bucketLabel);
    const bucketArn = `arn:aws:s3:::${bucketName}`;

    // Compile the CloudFormation exports
    let cloudFormationExports = {
      functions: { },
      resources: {
        [args.bucketLabel]: {
          "Type": "AWS::S3::Bucket",
          "Properties": {
            "BucketName": bucketName,
            "AccessControl": "Private",
          } as { [key: string]: any },
        },
      },
    };
    for (let propKey in args.extraProperties) {
      cloudFormationExports.resources[args.bucketLabel].Properties[propKey]
        = args.extraProperties[propKey];
    }

    // Return the cloud component
    return CloudComponent.defineNew({
      cloudFormationExports: cloudFormationExports,

      getObject: defineResourceInteraction({
        interaction: async function(args: { filePath: string }) {
          const s3 = new AWS.S3();
          return await (s3.getObject({
            Bucket: bucketName, 
            Key: args.filePath,
           }).promise());
        },
        iamPermissions: [{
          Effect: "Allow",
          Action: 's3:GetObject',
          Resource: bucketArn + '/*',
        }],
      }),

      putObject: defineResourceInteraction({
        interaction: async function(args: { filePath: string, data: BinaryData | string }) {
          const s3 = new AWS.S3();
          return (s3.putObject({
            Body: args.data,
            Bucket: bucketName,
            Key: args.filePath,
            ACL: `bucket-owner-full-control`,
          }).promise());
        },
        iamPermissions: [{
          Effect: "Allow",
          Action: 's3:PutObject',
          Resource: bucketArn + '/*',
        }],
      }),
    });
  }
});