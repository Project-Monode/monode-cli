"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StaticWebsiteHost = void 0;
const monode_serverless_1 = require("monode-serverless");
/// This is how StaticWebsiteHosts will be defined
exports.StaticWebsiteHost = monode_serverless_1.CloudType.defineNew({
    cloudTypeName: 'webhost',
    defineNew(args) {
        return {
            cloudFormationExports: {
                functions: {},
                resources: {
                    [`${args.hostingLabel}HostingBucket`]: {
                        "Type": "AWS::S3::Bucket",
                        "Properties": {
                            "AccessControl": "PublicRead",
                            "BucketName": "${self:service}-${self:provider.stage}-whb",
                            [`${args.hostingLabel}Configuration`]: {
                                "IndexDocument": "index.html"
                            }
                        }
                    },
                    [`${args.hostingLabel}HostingBucketPolicy`]: {
                        "Type": "AWS::S3::BucketPolicy",
                        "Properties": {
                            "Bucket": {
                                "Ref": `${args.hostingLabel}HostingBucket`
                            },
                            "PolicyDocument": {
                                "Statement": [
                                    {
                                        "Action": [
                                            "s3:GetObject"
                                        ],
                                        "Effect": "Allow",
                                        "Resource": {
                                            "Fn::Sub": `arn:aws:s3:::\${${args.hostingLabel}HostingBucket}/*`
                                        },
                                        "Principal": {
                                            "CanonicalUser": {
                                                "Fn::GetAtt": `${args.hostingLabel}CloudFrontOriginAccessIdentity.S3CanonicalUserId`
                                            }
                                        }
                                    }
                                ]
                            }
                        }
                    },
                    [`${args.hostingLabel}CloudFrontOriginAccessIdentity`]: {
                        "Type": "AWS::CloudFront::CloudFrontOriginAccessIdentity",
                        "Properties": {
                            "CloudFrontOriginAccessIdentityConfig": {
                                "Comment": "Temmp comment. "
                            }
                        }
                    },
                    [`${args.hostingLabel}CloudFrontDistribution`]: {
                        "Type": "AWS::CloudFront::Distribution",
                        "Properties": {
                            "DistributionConfig": {
                                "CustomErrorResponses": [
                                    {
                                        "ErrorCode": 403,
                                        "ResponseCode": 200,
                                        "ResponsePagePath": "/index.html"
                                    },
                                    {
                                        "ErrorCode": 404,
                                        "ResponseCode": 200,
                                        "ResponsePagePath": "/index.html"
                                    }
                                ],
                                "DefaultCacheBehavior": {
                                    "AllowedMethods": [
                                        "GET",
                                        "HEAD",
                                        "OPTIONS"
                                    ],
                                    "CachedMethods": [
                                        "GET",
                                        "HEAD",
                                        "OPTIONS"
                                    ],
                                    "Compress": true,
                                    "DefaultTTL": 3600,
                                    "ForwardedValues": {
                                        "Cookies": {
                                            "Forward": "none"
                                        },
                                        "QueryString": false
                                    },
                                    "MaxTTL": 86400,
                                    "MinTTL": 60,
                                    "TargetOriginId": "s3origin",
                                    "ViewerProtocolPolicy": "redirect-to-https"
                                },
                                "DefaultRootObject": "index.html",
                                "Enabled": true,
                                "HttpVersion": "http2",
                                "Origins": [
                                    {
                                        "DomainName": {
                                            "Fn::GetAtt": `${args.hostingLabel}HostingBucket.DomainName`
                                        },
                                        "Id": "s3origin",
                                        "S3OriginConfig": {
                                            "OriginAccessIdentity": {
                                                "Fn::Sub": `origin-access-identity/cloudfront/\${${args.hostingLabel}CloudFrontOriginAccessIdentity}`
                                            }
                                        }
                                    }
                                ],
                                "PriceClass": "PriceClass_All"
                            }
                        }
                    }
                },
            },
        };
    }
});
