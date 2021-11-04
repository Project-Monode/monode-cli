"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const CLOUD_TYPE_NAME = 'cloudtype';
const MANAGED_BY_MONODE_TAG = 'MONODE';
const trimTsExtension = function (tsFilePath) {
    return tsFilePath.substring(0, tsFilePath.length - 3);
};
let cloudTypeConfigByName = {};
let logs = 'Compilation Logs:\n';
// @ts-ignore
for (let i in FILES_BY_FILE_TYPE[CLOUD_TYPE_NAME]) {
    try {
        // @ts-ignore
        const filePath = trimTsExtension(FILES_BY_FILE_TYPE[CLOUD_TYPE_NAME][i]);
        const ctExports = require(filePath);
        for (const key in ctExports) {
            if ((_a = ctExports === null || ctExports === void 0 ? void 0 : ctExports[key]) === null || _a === void 0 ? void 0 : _a.cloudTypeName) {
                cloudTypeConfigByName[(_b = ctExports === null || ctExports === void 0 ? void 0 : ctExports[key]) === null || _b === void 0 ? void 0 : _b.cloudTypeName] = ctExports;
                break;
            }
        }
        // @ts-ignore
        logs += ` + Cloud Type: "${FILES_BY_FILE_TYPE[CLOUD_TYPE_NAME][i]}".\n`;
    }
    catch (e) {
        // @ts-ignore
        logs += ` ! ERROR when reading in cloud type "${FILES_BY_FILE_TYPE[CLOUD_TYPE_NAME][i]}": ${e.toString()}\n`;
    }
}
const allCloudFormationExports = {
    functions: {},
    resources: {},
};
let lambdaHandlers_file = ``;
// Read in all cloud config from project files
for (let cloudTypeName in cloudTypeConfigByName) {
    // @ts-ignore
    for (let pathIndex in FILES_BY_FILE_TYPE[cloudTypeName]) {
        try {
            // @ts-ignore
            const filePath = trimTsExtension(FILES_BY_FILE_TYPE[cloudTypeName][pathIndex]);
            const cloudTypeExports = require(filePath);
            // Copy cloud config
            if (cloudTypeExports === null || cloudTypeExports === void 0 ? void 0 : cloudTypeExports.default) {
                let newCloudFormationExports = (_c = cloudTypeExports === null || cloudTypeExports === void 0 ? void 0 : cloudTypeExports.default) === null || _c === void 0 ? void 0 : _c.cloudFormationExports;
                // Copy functions
                for (let functionName in newCloudFormationExports === null || newCloudFormationExports === void 0 ? void 0 : newCloudFormationExports.functions) {
                    allCloudFormationExports.functions[functionName] = newCloudFormationExports === null || newCloudFormationExports === void 0 ? void 0 : newCloudFormationExports.functions[functionName];
                    lambdaHandlers_file += (_d = cloudTypeExports === null || cloudTypeExports === void 0 ? void 0 : cloudTypeExports.default) === null || _d === void 0 ? void 0 : _d.buildHandlerEntry({ functionName: functionName, filePath: filePath });
                }
                // Copy resources
                for (let resourceName in newCloudFormationExports === null || newCloudFormationExports === void 0 ? void 0 : newCloudFormationExports.resources) {
                    allCloudFormationExports.resources[resourceName] = newCloudFormationExports === null || newCloudFormationExports === void 0 ? void 0 : newCloudFormationExports.resources[resourceName];
                }
            }
            // @ts-ignore
            logs += ` + Cloud Component: "${FILES_BY_FILE_TYPE[cloudTypeName][pathIndex]}".\n`;
        }
        catch (e) {
            // @ts-ignore
            logs += ` ! ERROR when reading in cloud component config "${FILES_BY_FILE_TYPE[cloudTypeName][pathIndex]}": ${e.toString()}\n`;
        }
    }
}
// Read in the serverless config
let serverlessConfig = JSON.parse(fs.readFileSync(`../serverless-project/serverless.json`).toString());
// Delete the old cloud resources
let resourcesToDelete = [];
for (let resourceName in serverlessConfig.resources.Resources) {
    if (resourceName.startsWith(MANAGED_BY_MONODE_TAG)) {
        resourcesToDelete.push(resourceName);
    }
}
for (let resourceName in resourcesToDelete) {
    delete serverlessConfig.resources.Resources[resourceName];
}
let functionsToDelete = [];
for (let functionName in serverlessConfig.functions) {
    if (functionName.startsWith(MANAGED_BY_MONODE_TAG)) {
        functionsToDelete.push(functionName);
    }
}
for (let functionName in functionsToDelete) {
    delete serverlessConfig.functions[functionName];
}
// Add the new resources
for (let resourceName in allCloudFormationExports === null || allCloudFormationExports === void 0 ? void 0 : allCloudFormationExports.resources) {
    serverlessConfig.resources.Resources[`${MANAGED_BY_MONODE_TAG}${resourceName}`]
        = allCloudFormationExports === null || allCloudFormationExports === void 0 ? void 0 : allCloudFormationExports.resources[resourceName];
}
for (let functionName in allCloudFormationExports === null || allCloudFormationExports === void 0 ? void 0 : allCloudFormationExports.functions) {
    let newFunction = allCloudFormationExports === null || allCloudFormationExports === void 0 ? void 0 : allCloudFormationExports.functions[functionName];
    newFunction.handler = `mnd_lambda_handlers.${functionName}`;
    newFunction.package = {
        artifact: `mnd_functions.zip`,
        individually: true,
        exclude: [
            "*/**"
        ],
        include: []
    };
    serverlessConfig.functions[`${MANAGED_BY_MONODE_TAG}${functionName}`] = newFunction;
}
fs.writeFileSync(`../serverless-project/serverless.json`, JSON.stringify(serverlessConfig, null, 2));
// Export the lambda handlers file
fs.writeFileSync(`${__dirname}/mnd_lambda_handlers.js`, lambdaHandlers_file);
// Write the logs
fs.writeFileSync(`${__dirname}/mnd_compile_logs.txt`, logs);
