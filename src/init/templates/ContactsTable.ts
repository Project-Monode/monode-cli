import { DynamoDB, SchemaType } from "../cloud-types/DynamoDB";


// This will be the schema for the contacts table
export interface Contact {
  firstName: string,
  lastName: string,
  phoneNumber?: number,
  emailAddress?: string,
  addressLine1?: string,
  addressLine2?: string,
}


// Define a new DynamoDB table (Alwayse export cloud components so that Monode can find them.)
export const ContactsTable = DynamoDB.defineNew({
  schemaType: new SchemaType<Contact>(),
  tableName: 'ContactsTable',
  primaryKey: {
    name: 'firstName',
    type: 'S',
  },
  secondaryKey: {
    name: 'lastName',
    type: 'S',
  },
});