declare type ValidDynamoDBKeyTypes = number | string | BinaryData;
declare type ValidDynamoDBAttributeTypes = ValidDynamoDBKeyTypes | boolean | undefined | Set<string> | Set<number> | Set<BinaryData> | [
    string
] | [number] | [BinaryData] | {
    [key: string]: string | number | boolean | BinaryData;
};
export declare type DynamoDBSchema<Schema extends DynamoDBSchema<Schema>> = {
    [Key in keyof Schema]: ValidDynamoDBAttributeTypes;
};
export declare class SchemaType<Type> {
}
export declare const DynamoDB: any;
export {};
