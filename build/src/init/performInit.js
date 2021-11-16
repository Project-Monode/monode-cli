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
        relativeSourceFilePath: `./templates/DynamoDB.cloudtype.ts`,
        relativeExportPath: `./src/cloud-types/DynamoDB.cloudtype.ts`,
    });
    cloneSourceFile({
        relativeSourceFilePath: `./templates/Lambda.cloudtype.ts`,
        relativeExportPath: `./src/cloud-types/Lambda.cloudtype.ts`,
    });
    cloneSourceFile({
        relativeSourceFilePath: `./templates/S3.cloudtype.ts`,
        relativeExportPath: `./src/cloud-types/S3.cloudtype.ts`,
    });
    cloneSourceFile({
        relativeSourceFilePath: `./templates/StaticWebsiteHost.cloudtype.ts`,
        relativeExportPath: `./src/cloud-types/StaticWebsiteHost.cloudtype.ts`,
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
