import { CloudComponent, defineResourceInteraction, buildResourceName } from "monode-serverless";
import * as AWS from 'aws-sdk';


// Compute different versions of the bucket name
const bucketLabel = 'ExampleStandAloneComponent';
const bucketName = buildResourceName(bucketLabel);
const bucketArn = `arn:aws:s3:::${bucketName}`;


// Define a stand-alone cloud component
export const ExampleStandAloneComponent = CloudComponent.defineNew({
  // Define the serverless/CloudFormation config for this resource
  cloudFormationExports: {
    functions: {},
    resources: {
      [bucketLabel]: {
        "Type": "AWS::S3::Bucket",
        "Properties": {
          "BucketName": bucketName,
          "AccessControl": "Private",
        },
      },
    },
  },

  // Define a get object interaction
  getObject: defineResourceInteraction({
    // Call the AWS APIs for this interaction
    interaction: async function(args: { filePath: string }) {
      const s3 = new AWS.S3();
      return await (s3.getObject({
        Bucket: bucketName, 
        Key: args.filePath,
        }).promise());
    },

    // These are the permissions needed to invoke this interaction
    iamPermissions: [{
      Effect: "Allow",
      Action: 's3:GetObject',
      Resource: bucketArn + '/*',
    }],
  }),

  // Define a put object interaction
  putObject: defineResourceInteraction({
    // Call the AWS APIs for this interaction
    interaction: async function(args: { filePath: string, data: BinaryData | string }) {
      const s3 = new AWS.S3();
      return (s3.putObject({
        Body: args.data,
        Bucket: bucketName,
        Key: args.filePath,
        ACL: `bucket-owner-full-control`,
      }).promise());
    },

    // These are the permissions needed to invoke this interaction
    iamPermissions: [{
      Effect: "Allow",
      Action: 's3:PutObject',
      Resource: bucketArn + '/*',
    }],
  }),
});