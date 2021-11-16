import * as fs from 'fs';
import * as path from 'path';
import { getTsFilePathsByType } from '../getTsFilePathsByType';
import * as TsNode from 'ts-node';
import { runCmdAsync } from '../utils/run-cmd';
import { zipDir } from '../utils/zipDir';
import { MonodeConfig } from '../utils/MonodeConfig';

export const CLOUD_TYPE_NAME = 'cloudtype';

export async function performMultistageCompile(args: {
  relativePath: string,
}) {
  // Read in the Monode config
  let monodeConfig;
  try {
    monodeConfig = JSON.parse(fs.readFileSync(`${args.relativePath}/monode.json`).toString()) as MonodeConfig;
  } catch(e: any) {
    console.log(`Could not find or could not parse "monode.json".`);
    return;
  }

  // Update tsconfig.json
  const originalTsconfigFileContents = fs.readFileSync(`${args.relativePath}/tsconfig.json`);
  let tempTsconfigJson = JSON.parse(originalTsconfigFileContents.toString());
  tempTsconfigJson.compilerOptions.outDir = `./mnd_temp_build/src`;
  tempTsconfigJson.compilerOptions.watch = false;
  fs.writeFileSync(`${args.relativePath}/tsconfig.json`, JSON.stringify(tempTsconfigJson));
  if (!fs.existsSync(`${args.relativePath}/mnd_temp_build`)) {
    fs.mkdirSync(`${args.relativePath}/mnd_temp_build`);
  }

  // Update package.json
  const originalPackageFileContents = fs.readFileSync(`${args.relativePath}/package.json`);
  let tempPackageJson = JSON.parse(originalPackageFileContents.toString());
  tempPackageJson.main = `${args.relativePath}/mnd_temp_build/mnd-index.js`;
  fs.writeFileSync(`${args.relativePath}/package.json`, JSON.stringify(tempPackageJson));

  // Extract cloud config
  const filePathsByFileType = getTsFilePathsByType(args.relativePath);
  let getCloudTypes_File = fs.readFileSync(`${__dirname}/index-getCloudTypes.js`).toString();
  getCloudTypes_File = `const FILES_BY_FILE_TYPE = ${JSON.stringify(filePathsByFileType)};\n${getCloudTypes_File.substring(getCloudTypes_File.indexOf('\n'), getCloudTypes_File.length)}`;
  fs.writeFileSync(`${args.relativePath}/mnd_temp_build/mnd-index.js`, getCloudTypes_File);
  await runCmdAsync({ command: `tsc`});
  await runCmdAsync({ command: `node .`});
  const cloudTypeConfigs = fs.readFileSync(`${args.relativePath}/mnd_temp_build/mnd_compile_logs.txt`).toString();
  console.log(cloudTypeConfigs);//`Cloud Type Configs: ${JSON.stringify(cloudTypeConfigs, null, 2)}`);

  // Extract cloud function code
  fs.unlinkSync(`${args.relativePath}/mnd_temp_build/mnd-index.js`);
  fs.unlinkSync(`${args.relativePath}/mnd_temp_build/mnd_compile_logs.txt`);
  fs.writeFileSync(
    `${args.relativePath}/mnd_temp_build/package.json`,
    JSON.stringify({ dependencies: tempPackageJson?.dependencies }, null, 2),
  );
  const npm = require('npm-commands');
  await npm().cwd(`${args.relativePath}/mnd_temp_build/`).install();
  if (fs.existsSync(`${args.relativePath}/mnd_temp_build/package.json`)) {
    fs.unlinkSync(`${args.relativePath}/mnd_temp_build/package.json`);
  }
  if (fs.existsSync(`${args.relativePath}/mnd_temp_build/package-lock.json`)) {
    fs.unlinkSync(`${args.relativePath}/mnd_temp_build/package-lock.json`);
  }
  const zipOutputPath = path.resolve(
    path.resolve(`./`, monodeConfig.relativeServerlessPath),
    `mnd_functions.zip`,
  );
  console.log(monodeConfig.relativeServerlessPath);
  console.log(zipOutputPath);
  await zipDir({
    inputPath: `${args.relativePath}/mnd_temp_build`,
    outputPath: path.resolve(args.relativePath, zipOutputPath),
  });

  // Undo all changes
  fs.rmdirSync(`${args.relativePath}/mnd_temp_build`, { recursive: true });
  fs.writeFileSync(`${args.relativePath}/package.json`, originalPackageFileContents);
  fs.writeFileSync(`${args.relativePath}/tsconfig.json`, originalTsconfigFileContents);
}