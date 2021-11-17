"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performMultistageCompile = exports.CLOUD_TYPE_NAME = void 0;
const fs = require("fs");
const path = require("path");
const getTsFilePathsByType_1 = require("../getTsFilePathsByType");
const run_cmd_1 = require("../utils/run-cmd");
const zipDir_1 = require("../utils/zipDir");
exports.CLOUD_TYPE_NAME = 'cloudtype';
async function performMultistageCompile(args) {
    // Read in the Monode config
    let monodeConfig;
    try {
        monodeConfig = JSON.parse(fs.readFileSync(`${args.relativePath}/monode.json`).toString());
    }
    catch (e) {
        console.log(`Could not find or could not parse "monode.json".`);
        return;
    }
    const serverlessPathAbsolute = path.resolve(`./`, monodeConfig.relativeServerlessPath);
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
    const filePathsByFileType = (0, getTsFilePathsByType_1.getTsFilePathsByType)(args.relativePath);
    let getCloudTypes_File = fs.readFileSync(`${__dirname}/index-getCloudTypes.js`).toString();
    getCloudTypes_File = `const FILES_BY_FILE_TYPE = ${JSON.stringify(filePathsByFileType)};\n${getCloudTypes_File.substring(getCloudTypes_File.indexOf('\n'), getCloudTypes_File.length)}`;
    const serverlessJsonPath = path.resolve(serverlessPathAbsolute, `serverless.json`);
    getCloudTypes_File = `const SERVERLESS_PATH = ${JSON.stringify(serverlessJsonPath)};\n` + getCloudTypes_File;
    const serverlessConfig = JSON.parse(fs.readFileSync(serverlessJsonPath).toString());
    getCloudTypes_File = `process.env.service = "${serverlessConfig.service}"\n` + getCloudTypes_File;
    getCloudTypes_File = `process.env.stage = "${serverlessConfig.provider.stage}"\n` + getCloudTypes_File;
    fs.writeFileSync(`${args.relativePath}/mnd_temp_build/mnd-index.js`, getCloudTypes_File);
    await (0, run_cmd_1.runCmdAsync)({ command: `tsc` });
    await (0, run_cmd_1.runCmdAsync)({ command: `node .` });
    const cloudTypeConfigs = fs.readFileSync(`${args.relativePath}/mnd_temp_build/mnd_compile_logs.txt`).toString();
    console.log(cloudTypeConfigs); //`Cloud Type Configs: ${JSON.stringify(cloudTypeConfigs, null, 2)}`);
    // Extract cloud function code
    fs.unlinkSync(`${args.relativePath}/mnd_temp_build/mnd-index.js`);
    fs.unlinkSync(`${args.relativePath}/mnd_temp_build/mnd_compile_logs.txt`);
    fs.writeFileSync(`${args.relativePath}/mnd_temp_build/package.json`, JSON.stringify({ dependencies: tempPackageJson === null || tempPackageJson === void 0 ? void 0 : tempPackageJson.dependencies }, null, 2));
    const npm = require('npm-commands');
    await npm().cwd(`${args.relativePath}/mnd_temp_build/`).install();
    if (fs.existsSync(`${args.relativePath}/mnd_temp_build/package.json`)) {
        fs.unlinkSync(`${args.relativePath}/mnd_temp_build/package.json`);
    }
    if (fs.existsSync(`${args.relativePath}/mnd_temp_build/package-lock.json`)) {
        fs.unlinkSync(`${args.relativePath}/mnd_temp_build/package-lock.json`);
    }
    const zipOutputPath = path.resolve(serverlessPathAbsolute, `mnd_functions.zip`);
    await (0, zipDir_1.zipDir)({
        inputPath: `${args.relativePath}/mnd_temp_build`,
        outputPath: path.resolve(args.relativePath, zipOutputPath),
    });
    // Undo all changes
    fs.rmdirSync(`${args.relativePath}/mnd_temp_build`, { recursive: true });
    fs.writeFileSync(`${args.relativePath}/package.json`, originalPackageFileContents);
    fs.writeFileSync(`${args.relativePath}/tsconfig.json`, originalTsconfigFileContents);
}
exports.performMultistageCompile = performMultistageCompile;
