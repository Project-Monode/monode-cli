import * as fs from 'fs';
import * as path from 'path';
import { getAllTsFilesInDirectory } from '../utils/getAllTsFilesInDirectory';
import { runCmdAsync } from '../utils/run-cmd';
import { zipDir } from '../utils/zipDir';
import { MonodeConfig } from '../utils/MonodeConfig';

export const CLOUD_TYPE_NAME = 'cloudtype';

export async function performMultistageCompile(args: {
  relativePath: string,
}) {
  if (!args.relativePath) {
    args.relativePath = './';
  }
  // Read in the Monode config
  let monodeConfig;
  try {
    monodeConfig = JSON.parse(fs.readFileSync(`${args.relativePath}/monode.json`).toString()) as MonodeConfig;
  } catch(e: any) {
    console.log(`Could not find or could not parse "monode.json".`);
    return;
  }
  const serverlessPathAbsolute = path.resolve(
    path.resolve(`./`, args.relativePath),
    monodeConfig.relativeServerlessPath,
  );

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
  let tsFilePaths = getAllTsFilesInDirectory(args.relativePath);
  for (let i in tsFilePaths) {
    tsFilePaths[i] = `./` + tsFilePaths[i].substring(
      args.relativePath.length,
      tsFilePaths[i].length,
    );
  }
  let getCloudTypes_File = fs.readFileSync(`${__dirname}/mnd-index.js`).toString();
  getCloudTypes_File = `const ALL_TS_FILE_PATHS = ${JSON.stringify(tsFilePaths)};\n${getCloudTypes_File.substring(getCloudTypes_File.indexOf('\n'), getCloudTypes_File.length)}`;
  const serverlessJsonPath = path.resolve(serverlessPathAbsolute, `serverless.json`);
  getCloudTypes_File = `const SERVERLESS_PATH = ${JSON.stringify(serverlessJsonPath)};\n` + getCloudTypes_File;
  console.log(`Exporting to "${serverlessJsonPath}"`);
  const serverlessConfig = JSON.parse(fs.readFileSync(serverlessJsonPath).toString());
  getCloudTypes_File = `process.env.service = "${serverlessConfig.service}"\n` + getCloudTypes_File;
  getCloudTypes_File = `process.env.stage = "${serverlessConfig.provider.stage}"\n` + getCloudTypes_File;
  getCloudTypes_File = `process.env.region = "${serverlessConfig.provider.region}"\n` + getCloudTypes_File;
  fs.writeFileSync(`${args.relativePath}/mnd_temp_build/mnd-index.js`, getCloudTypes_File);
  await runCmdAsync({ command: `npx tsc`, path: args.relativePath });
  await runCmdAsync({ command: `node .`, path: args.relativePath });
  const compilationLogs = fs.readFileSync(`${args.relativePath}/mnd_temp_build/mnd_compile_logs.txt`).toString();
  console.log(compilationLogs);

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
    serverlessPathAbsolute,
    `mnd_functions.zip`,
  );
  await zipDir({
    inputPath: `${args.relativePath}/mnd_temp_build`,
    outputPath: path.resolve(args.relativePath, zipOutputPath),
  });

  // Undo all changes
  fs.rmdirSync(`${args.relativePath}/mnd_temp_build`, { recursive: true });
  fs.writeFileSync(`${args.relativePath}/package.json`, originalPackageFileContents);
  fs.writeFileSync(`${args.relativePath}/tsconfig.json`, originalTsconfigFileContents);
}