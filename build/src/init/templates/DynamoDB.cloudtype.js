"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDB = exports.SchemaType = void 0;
const monode_serverless_1 = require("monode-serverless");
const AWS = require("aws-sdk");
class SchemaType {
}
exports.SchemaType = SchemaType;
/// This is how DynamoDBs will be defined
exports.DynamoDB = monode_serverless_1.CloudType.defineNew({
    cloudTypeName: 'dynamodb',
    defineNew(args) {
        // Generate the json
        let resources = {
            [args.tableName]: {
                "Type": "AWS::DynamoDB::Table",
                "Properties": {
                    "AttributeDefinitions": [
                        {
                            "AttributeName": args.primaryKey.name,
                            "AttributeType": args.primaryKey.type
                        }
                    ],
                    "KeySchema": [
                        {
                            "AttributeName": args.primaryKey.name,
                            "KeyType": "HASH"
                        }
                    ],
                    "BillingMode": "PAY_PER_REQUEST",
                    "TableName": `test-project-dev-${args.tableName}`,
                }
            }
        };
        // When applicable configue a secondary key
        if (args.secondaryKey) {
            resources[args.tableName].Properties.AttributeDefinitions.push({
                "AttributeName": args.secondaryKey.name.toString(),
                "AttributeType": args.secondaryKey.type,
            });
            resources[args.tableName].Properties.KeySchema.push({
                "AttributeName": args.secondaryKey.name.toString(),
                "KeyType": "RANGE",
            });
        }
        return {
            cloudFormationExports: {
                resources: resources,
            },
            put: async function (item) {
                return await (new AWS.DynamoDB.DocumentClient().put({
                    TableName: "test-project-dev-" + args.tableName,
                    Item: item,
                }).promise());
                //return "test-project-dev-" + args.tableName;
            }
        };
    }
});
