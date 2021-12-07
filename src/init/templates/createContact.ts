import { HttpTriggeredLambda } from "../cloud-types/HttpTriggeredLambda";
import { ContactsTable, Contact } from "./ContactsTable";

// Define an http-triggered Lambda
export const createContact = HttpTriggeredLambda.defineNew({
  functionName: 'createContact',
  httpVerb: 'put',

  // We need permission to put items in the contacts DynamoDB table.
  iamPermissions: [
    ContactsTable.put.iamPermissions,
  ],

  // This is the body of code that will run. There is no need to parse the http request
  function: async function(contact: Contact) {
    await ContactsTable.put(contact);
    return {
      statusCode: 200,
      body: {},
    }
  }
});