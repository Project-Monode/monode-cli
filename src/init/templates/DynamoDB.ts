import { CloudComponentType, buildResourceName, CloudComponent, defineResourceInteraction } from 'monode-serverless';
import * as AWS from 'aws-sdk';


/// These are the types that DynamoDB allows to be table keys
type ValidDynamoDBKeyTypes = 
  number | string | BinaryData

/// These are the types that DynamoDB allows to be attributes of a table
type ValidDynamoDBAttributeTypes = 
  ValidDynamoDBKeyTypes | boolean | undefined |
  Set<string> | Set<number> | Set<BinaryData> |
  [string] | [number] | [BinaryData] |
  { [key: string]: string | number | boolean | BinaryData }

/// Allows only the keys of an object that can be valid DynamoDB Keys
type ValidDynamoDBKeyOf<Schema extends DynamoDBSchema<Schema>> =
  keyof Pick<Schema, {[Key in keyof Schema]-?: Schema[Key] extends ValidDynamoDBKeyTypes ? Key : never}[keyof Schema]>

/// Configures a DynamoDB table schema
export type DynamoDBSchema<Schema extends DynamoDBSchema<Schema>> = {
  [Key in keyof Schema]: ValidDynamoDBAttributeTypes;
}

// This lets us infer a DynamoDB table's schema's TypeScript type
export class SchemaType<Type> {}

// Infer the DynamoDB property-type abbreviation
type DynamoDBTypeAbbreviationFor<Schema extends DynamoDBSchema<Schema>, Key extends ValidDynamoDBKeyOf<Schema>>
  = Schema[Key] extends string ? 'S' : Schema[Key] extends number ? 'N' : 'B';

// This is the format DynamoDB Table key definitions need to take
interface DynamoDBKeyConfig<Schema extends DynamoDBSchema<Schema>, Key extends ValidDynamoDBKeyOf<Schema>> {
  name: Key
  type: DynamoDBTypeAbbreviationFor<Schema, Key>
}



/// This is how DynamoDB tables will be defined
export const DynamoDB = CloudComponentType.defineNew({
  defineNew<Schema extends DynamoDBSchema<Schema>, PrimaryKey extends ValidDynamoDBKeyOf<Schema>, SecondaryKey extends Exclude<ValidDynamoDBKeyOf<Schema>, PrimaryKey>>(
    args: {
      schemaType: SchemaType<Schema>
      tableName: string
      primaryKey: DynamoDBKeyConfig<Schema, PrimaryKey>
      secondaryKey?: DynamoDBKeyConfig<Schema, SecondaryKey>
      extraProperties?: { [key: string]: any }
    }
  ) {
    const tableArn = `arn:aws:dynamodb:${process.env.region?.toLowerCase()}:*:table/${args.tableName}`;

    // Define the serverless/CloudFormation config for this resource
    let resources = {
      [args.tableName]: {
        "Type":"AWS::DynamoDB::Table",
        "Properties":{
          "AttributeDefinitions":[
            {
              "AttributeName": args!.primaryKey!.name,
              "AttributeType": args!.primaryKey!.type
            }
          ],
          "KeySchema":[
            {
              "AttributeName": args!.primaryKey!.name,
              "KeyType":"HASH"
            }
          ],
          "BillingMode": "PAY_PER_REQUEST",
          "TableName": buildResourceName(args.tableName),
        } as { [key: string]: any }
      }
    }
  
    // When applicable configue a secondary key
    if (args.secondaryKey) {
      (resources as any)[args.tableName].Properties.AttributeDefinitions.push({
        "AttributeName": args!.secondaryKey!.name!.toString(),
        "AttributeType": args!.secondaryKey!.type,
      });
      (resources as any)[args.tableName].Properties.KeySchema.push({
        "AttributeName": args!.secondaryKey!.name!.toString(),
        "KeyType": "RANGE",
      });
    }

    // Add any extra CloudFormation properties
    for (let propKey in args.extraProperties) {
      resources[args.tableName].Properties[propKey]
        = args.extraProperties[propKey];
    }

    return CloudComponent.defineNew({
      // Define the serverless/CloudFormation config for this resource
      cloudFormationExports: {
        resources: resources,
      },

      // Define a put item interaction
      put: defineResourceInteraction({
        // Call the AWS APIs for this interaction
        interaction: async function(item: Schema) {
          return await (new AWS.DynamoDB.DocumentClient().put({
            TableName : buildResourceName(args.tableName),
            Item: item,
          }).promise());
        },

        // These are the permissions needed to invoke this interaction
        iamPermissions: [{
          Effect: "Allow",
          Action: 'dynamodb:WriteItem',
          Resource: tableArn,
        }],
      }),
    });
  }
});