import * as fs from 'fs';
import * as path from 'path';
import { runCmdAsync } from '../utils/run-cmd';

export async function performInit() {
  cloneSourceFile({
    relativeSourceFilePath: `./templates/package.json`,
    relativeExportPath: `package.json`,
  });
  cloneSourceFile({
    relativeSourceFilePath: `./templates/monode.json`,
    relativeExportPath: `monode.json`,
  });
  cloneSourceFile({
    relativeSourceFilePath: `./templates/tsconfig.json`,
    relativeExportPath: `tsconfig.json`,
  });
  cloneSourceFile({
    relativeSourceFilePath: `./templates/.gitignore`,
    relativeExportPath: `.gitignore`,
  });
  fs.mkdirSync(`./src`);
  fs.mkdirSync(`./src/cloud-types`);
  cloneSourceFile({
    relativeSourceFilePath: `./templates/DynamoDB.ts`,
    relativeExportPath: `./src/cloud-types/DynamoDB.ts`,
  });
  cloneSourceFile({
    relativeSourceFilePath: `./templates/HttpTriggeredLambda.ts`,
    relativeExportPath: `./src/cloud-types/HttpTriggeredLambda.ts`,
  });
  cloneSourceFile({
    relativeSourceFilePath: `./templates/S3Bucket.ts`,
    relativeExportPath: `./src/cloud-types/S3Bucket.ts`,
  });
  fs.mkdirSync(`./src/contact-book-microservice`);
  cloneSourceFile({
    relativeSourceFilePath: `./templates/ContactsTable.ts`,
    relativeExportPath: `./src/contact-book-microservice/ContactsTable.ts`,
  });
  cloneSourceFile({
    relativeSourceFilePath: `./templates/createContact.ts`,
    relativeExportPath: `./src/contact-book-microservice/createContact.ts`,
  });
  fs.mkdirSync(`./src/more-examples`);
  cloneSourceFile({
    relativeSourceFilePath: `./templates/ExampleS3Bucket.ts`,
    relativeExportPath: `./src/more-examples/ExampleS3Bucket.ts`,
  });
  cloneSourceFile({
    relativeSourceFilePath: `./templates/ExampleStandAloneComponent.ts`,
    relativeExportPath: `./src/more-examples/ExampleStandAloneComponent.ts`,
  });
  runCmdAsync({ command: 'npm i --save'});
};



async function cloneSourceFile(args: {
  relativeSourceFilePath: string,
  relativeExportPath: string,
}) {
  //console.log(path.resolve(__dirname, `../../../src/init`));
  let inputPath = path.resolve(path.resolve(__dirname, `../../../src/init`), args.relativeSourceFilePath);
  fs.writeFileSync(
    path.resolve(`./`, args.relativeExportPath),
    fs.readFileSync(inputPath),
  );
}
