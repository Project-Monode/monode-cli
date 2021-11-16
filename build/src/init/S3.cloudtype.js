"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3 = void 0;
const monode_serverless_1 = require("monode-serverless");
const AWS = require("aws-sdk");
/// This is how S3s will be defined
exports.S3 = monode_serverless_1.CloudType.defineNew({
    cloudTypeName: 's3',
    defineNew(args) {
        const bucketName = `multi-compile-sandbox-dev-${args.bucketLabel}`;
        return {
            cloudFormationExports: {
                functions: {},
                resources: {
                    [args.bucketLabel]: {
                        "Type": "AWS::S3::Bucket",
                        "Properties": {
                            "BucketName": bucketName,
                            "AccessControl": "Private",
                        },
                    },
                },
            },
            getObject: async function (args) {
                const s3 = new AWS.S3();
                return await (s3.getObject({
                    Bucket: bucketName,
                    Key: args.filePath,
                }).promise());
            },
            putObject: async function (args) {
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
