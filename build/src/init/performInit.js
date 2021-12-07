"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performInit = void 0;
const fs = require("fs");
const path = require("path");
const run_cmd_1 = require("../utils/run-cmd");
async function performInit() {
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
    (0, run_cmd_1.runCmdAsync)({ command: 'npm i --save' });
}
exports.performInit = performInit;
;
async function cloneSourceFile(args) {
    //console.log(path.resolve(__dirname, `../../../src/init`));
    let inputPath = path.resolve(path.resolve(__dirname, `../../../src/init`), args.relativeSourceFilePath);
    fs.writeFileSync(path.resolve(`./`, args.relativeExportPath), fs.readFileSync(inputPath));
}
