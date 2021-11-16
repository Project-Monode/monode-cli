import { CloudType } from 'monode-serverless';
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

export class SchemaType<Type> {}

//type DynamoDBAbbreviation = 'N' | 'S' | 'B'
type DynamoDBTypeAbbreviationFor<Schema extends DynamoDBSchema<Schema>, Key extends ValidDynamoDBKeyOf<Schema>>
  = Schema[Key] extends string ? 'S' : Schema[Key] extends number ? 'N' : 'B';

interface DynamoDBKeyConfig<Schema extends DynamoDBSchema<Schema>, Key extends ValidDynamoDBKeyOf<Schema>> {
  name: Key
  type: DynamoDBTypeAbbreviationFor<Schema, Key>
}



/// This is how DynamoDBs will be defined
export const DynamoDB = CloudType.defineNew({
  cloudTypeName: 'dynamodb',
  defineNew<Schema extends DynamoDBSchema<Schema>, PrimaryKey extends ValidDynamoDBKeyOf<Schema>, SecondaryKey extends Exclude<ValidDynamoDBKeyOf<Schema>, PrimaryKey>>(
    args: {
      schemaType: SchemaType<Schema>
      tableName: string
      primaryKey: DynamoDBKeyConfig<Schema, PrimaryKey>
      secondaryKey?: DynamoDBKeyConfig<Schema, SecondaryKey>
    }
  ) {
    // Generate the json
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
          "TableName": `test-project-dev-${args.tableName}`,
        }
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

    return {
      cloudFormationExports: {
        resources: resources,
      },
      put: async function(item: Schema) {
        return await (new AWS.DynamoDB.DocumentClient().put({
          TableName : "test-project-dev-" + args.tableName,
          Item: item,
        }).promise());
        //return "test-project-dev-" + args.tableName;
      }
    };
  }
});