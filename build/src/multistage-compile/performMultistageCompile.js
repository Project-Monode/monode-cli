"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performMultistageCompile = exports.CLOUD_TYPE_NAME = void 0;
const fs = require("fs");
const path = require("path");
const getAllTsFilesInDirectory_1 = require("../utils/getAllTsFilesInDirectory");
const run_cmd_1 = require("../utils/run-cmd");
const zipDir_1 = require("../utils/zipDir");
const getServerlessConfigFilePath_1 = require("../utils/getServerlessConfigFilePath");
const YAML = require("yamljs");
exports.CLOUD_TYPE_NAME = 'cloudtype';
async function performMultistageCompile(args) {
    if (!args.relativePath) {
        args.relativePath = './';
    }
    const npm = require('npm-commands');
    // Read in the Monode config
    let monodeConfig;
    try {
        monodeConfig = JSON.parse(fs.readFileSync(`${args.relativePath}/monode.json`).toString());
    }
    catch (e) {
        console.log(`Could not find or could not parse "monode.json".`);
        return;
    }
    const serverlessPathAbsolute = path.resolve(path.resolve(`./`, args.relativePath), monodeConfig.relativeServerlessPath);
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
    if (!tempPackageJson.dependencies) {
        tempPackageJson.dependencies = {};
    }
    tempPackageJson.dependencies['yamljs'] = '^0.3.0';
    fs.writeFileSync(`${args.relativePath}/package.json`, JSON.stringify(tempPackageJson));
    await npm().cwd(`${args.relativePath}/`).install();
    // Extract cloud config
    let tsFilePaths = (0, getAllTsFilesInDirectory_1.getAllTsFilesInDirectory)(args.relativePath);
    for (let i in tsFilePaths) {
        tsFilePaths[i] = `./` + tsFilePaths[i].substring(args.relativePath.length, tsFilePaths[i].length);
    }
    let getCloudTypes_File = fs.readFileSync(`${__dirname}/mnd-index.js`).toString();
    getCloudTypes_File = `const ALL_TS_FILE_PATHS = ${JSON.stringify(tsFilePaths)};\n${getCloudTypes_File.substring(getCloudTypes_File.indexOf('\n'), getCloudTypes_File.length)}`;
    let serverlessConfigPath;
    try {
        serverlessConfigPath = (0, getServerlessConfigFilePath_1.getServerlessConfigFilePath)(serverlessPathAbsolute);
    }
    catch (e) {
        console.log(`Error! Could not find a serverless config file in "${serverlessPathAbsolute}"! Check your monode.json file.`);
        return;
    }
    getCloudTypes_File = `const SERVERLESS_PATH = ${JSON.stringify(serverlessConfigPath)};\n` + getCloudTypes_File;
    console.log(`Exporting to "${serverlessConfigPath}"`);
    // Read in the serverless config
    let serverlessConfig;
    if (serverlessConfigPath.endsWith('json')) {
        serverlessConfig = JSON.parse(fs.readFileSync(serverlessConfigPath).toString());
    }
    else {
        // @ts-ignore
        serverlessConfig = YAML.parse(fs.readFileSync(serverlessConfigPath).toString());
    }
    getCloudTypes_File = `process.env.service = "${serverlessConfig.service}"\n` + getCloudTypes_File;
    getCloudTypes_File = `process.env.stage = "${serverlessConfig.provider.stage}"\n` + getCloudTypes_File;
    getCloudTypes_File = `process.env.region = "${serverlessConfig.provider.region}"\n` + getCloudTypes_File;
    fs.writeFileSync(`${args.relativePath}/mnd_temp_build/mnd-index.js`, getCloudTypes_File);
    await (0, run_cmd_1.runCmdAsync)({ command: `npx tsc`, path: args.relativePath });
    await (0, run_cmd_1.runCmdAsync)({ command: `node .`, path: args.relativePath });
    const compilationLogs = fs.readFileSync(`${args.relativePath}/mnd_temp_build/mnd_compile_logs.txt`).toString();
    console.log(compilationLogs);
    // Extract cloud function code
    fs.unlinkSync(`${args.relativePath}/mnd_temp_build/mnd-index.js`);
    fs.unlinkSync(`${args.relativePath}/mnd_temp_build/mnd_compile_logs.txt`);
    fs.writeFileSync(`${args.relativePath}/mnd_temp_build/package.json`, JSON.stringify({ dependencies: tempPackageJson === null || tempPackageJson === void 0 ? void 0 : tempPackageJson.dependencies }, null, 2));
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
    await npm().cwd(`${args.relativePath}/`).install();
}
exports.performMultistageCompile = performMultistageCompile;
