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
