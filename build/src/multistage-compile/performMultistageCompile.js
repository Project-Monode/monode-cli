"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performMultistageCompile = exports.CLOUD_TYPE_NAME = void 0;
const fs = require("fs");
const getTsFilePathsByType_1 = require("../getTsFilePathsByType");
const run_cmd_1 = require("../utils/run-cmd");
exports.CLOUD_TYPE_NAME = 'cloudtype';
async function performMultistageCompile(args) {
    // Update tsconfig.json
    let tsconfigJson = JSON.parse(fs.readFileSync(`${args.relativePath}/tsconfig.json`).toString());
    const oldOutDir = tsconfigJson.compilerOptions.outDir;
    tsconfigJson.compilerOptions.outDir = `./mnd_temp_build/src`;
    const oldWatch = tsconfigJson.compilerOptions.watch;
    tsconfigJson.compilerOptions.watch = false;
    fs.writeFileSync(`${args.relativePath}/tsconfig.json`, JSON.stringify(tsconfigJson));
    if (!fs.existsSync(`${args.relativePath}/mnd_temp_build`)) {
        fs.mkdirSync(`${args.relativePath}/mnd_temp_build`);
    }
    // Generate the cloud types getter file
    const filePathsByFileType = (0, getTsFilePathsByType_1.getTsFilePathsByType)(args.relativePath);
    let getCloudTypes_File = fs.readFileSync(`${__dirname}/index-getCloudTypes.js`).toString();
    getCloudTypes_File = `const FILES_BY_FILE_TYPE = ${JSON.stringify(filePathsByFileType)};\n${getCloudTypes_File.substring(getCloudTypes_File.indexOf('\n'), getCloudTypes_File.length)}`;
    fs.writeFileSync(`${args.relativePath}/mnd_temp_build/index-getCloudTypes.js`, getCloudTypes_File);
    // Update package.json
    let packageJson = JSON.parse(fs.readFileSync(`${args.relativePath}/package.json`).toString());
    const oldMain = packageJson.main;
    packageJson.main = `${args.relativePath}/mnd_temp_build/index-getCloudTypes.js`;
    fs.writeFileSync(`${args.relativePath}/package.json`, JSON.stringify(packageJson));
    // Run the build
    await (0, run_cmd_1.runCmdAsync)({ command: `tsc` });
    await (0, run_cmd_1.runCmdAsync)({ command: `node .` });
    const cloudTypeConfigs = fs.readFileSync(`${args.relativePath}/mnd_temp_build/mnd_compile_logs.txt`).toString();
    console.log(cloudTypeConfigs); //`Cloud Type Configs: ${JSON.stringify(cloudTypeConfigs, null, 2)}`);
    // Undo any changes
    packageJson.main = oldMain;
    fs.writeFileSync(`${args.relativePath}/package.json`, JSON.stringify(packageJson, null, 2));
    tsconfigJson.compilerOptions.outDir = oldOutDir;
    tsconfigJson.compilerOptions.watch = oldWatch;
    fs.writeFileSync(`${args.relativePath}/tsconfig.json`, JSON.stringify(tsconfigJson, null, 2));
    fs.rmdirSync(`${args.relativePath}/mnd_temp_build`, { recursive: true });
}
exports.performMultistageCompile = performMultistageCompile;
