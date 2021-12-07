"use strict";
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const YAML = require('yamljs');
const MANAGED_BY_MONODE_TAG = 'MONODE';
const trimTsExtension = function (tsFilePath) {
    return tsFilePath.substring(0, tsFilePath.length - 3);
};
let logs = 'Compilation Logs:\n';
const allCloudFormationExports = {
    functions: {},
    resources: {},
};
let lambdaHandlers_file = `process.env.service = \"${process.env.service}\";\nprocess.env.stage = \"${process.env.stage}\";\nprocess.env.region = \"${process.env.region}\";\n`;
// @ts-ignore
for (let i in ALL_TS_FILE_PATHS) {
    try {
        // @ts-ignore
        const filePath = trimTsExtension(ALL_TS_FILE_PATHS[i]);
        const fileExports = require(filePath);
        for (let exportKey in fileExports) {
            if ((_a = fileExports[exportKey]) === null || _a === void 0 ? void 0 : _a.isMonodeCloudComponent) {
                let newCloudFormationExports = (_b = fileExports[exportKey]) === null || _b === void 0 ? void 0 : _b.cloudFormationExports;
                // Copy functions
                for (let functionName in newCloudFormationExports === null || newCloudFormationExports === void 0 ? void 0 : newCloudFormationExports.functions) {
                    allCloudFormationExports.functions[functionName] = newCloudFormationExports === null || newCloudFormationExports === void 0 ? void 0 : newCloudFormationExports.functions[functionName];
                    lambdaHandlers_file += (_c = fileExports[exportKey]) === null || _c === void 0 ? void 0 : _c.buildHandlerEntry({ functionName: functionName, filePath: filePath });
                }
                // Copy resources
                for (let resourceName in newCloudFormationExports === null || newCloudFormationExports === void 0 ? void 0 : newCloudFormationExports.resources) {
                    allCloudFormationExports.resources[resourceName] = newCloudFormationExports === null || newCloudFormationExports === void 0 ? void 0 : newCloudFormationExports.resources[resourceName];
                }
                // @ts-ignore
                logs += ` + Cloud Component: { ${exportKey} } in "${ALL_TS_FILE_PATHS[i]}"\n`;
            }
        }
    }
    catch (e) {
        // @ts-ignore
        logs += ` ! ERROR when reading in cloud component config "${ALL_TS_FILE_PATHS[i]}": ${e.toString()}\n`;
    }
}
// Read in the serverless config
let serverlessConfig;
// @ts-ignore
let configIsJson = SERVERLESS_PATH.endsWith('json');
if (configIsJson) {
    // @ts-ignore
    serverlessConfig = JSON.parse(fs.readFileSync(SERVERLESS_PATH).toString());
}
else {
    // @ts-ignore
    serverlessConfig = YAML.parse(fs.readFileSync(SERVERLESS_PATH).toString());
}
// Delete the old functions and resources
let functionsToDelete = [];
for (let functionName in serverlessConfig.functions) {
    if (functionName.startsWith(MANAGED_BY_MONODE_TAG)) {
        functionsToDelete.push(functionName);
    }
}
for (let i in functionsToDelete) {
    delete serverlessConfig.functions[functionsToDelete[i]];
}
let resourcesToDelete = [];
for (let resourceName in (_d = serverlessConfig.resources) === null || _d === void 0 ? void 0 : _d.Resources) {
    if (resourceName.startsWith(MANAGED_BY_MONODE_TAG)) {
        resourcesToDelete.push(resourceName);
    }
}
for (let i in resourcesToDelete) {
    (_e = serverlessConfig.resources) === null || _e === void 0 ? true : delete _e.Resources[resourcesToDelete[i]];
}
// Add the new functions resources
if (!serverlessConfig.functions) {
    serverlessConfig.functions = {};
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
if (!serverlessConfig.resources) {
    serverlessConfig.resources = {};
}
if (!serverlessConfig.resources.Resources) {
    serverlessConfig.resources.Resources = {};
}
for (let resourceName in allCloudFormationExports === null || allCloudFormationExports === void 0 ? void 0 : allCloudFormationExports.resources) {
    serverlessConfig.resources.Resources[`${MANAGED_BY_MONODE_TAG}${resourceName}`]
        = allCloudFormationExports === null || allCloudFormationExports === void 0 ? void 0 : allCloudFormationExports.resources[resourceName];
}
// Write the serverless config
serverlessConfig = removeNullValuesFromTemplate(serverlessConfig);
if (configIsJson) {
    // @ts-ignore
    fs.writeFileSync(SERVERLESS_PATH, JSON.stringify(serverlessConfig, null, 2));
}
else {
    // @ts-ignore
    fs.writeFileSync(SERVERLESS_PATH, YAML.stringify(serverlessConfig, 1024, 2));
}
// Export the lambda handlers file
fs.writeFileSync(`${__dirname}/mnd_lambda_handlers.js`, lambdaHandlers_file);
// Write the logs
fs.writeFileSync(`${__dirname}/mnd_compile_logs.txt`, logs);
function removeNullValuesFromTemplate(template) {
    let propsToRemove = [];
    for (let i in template) {
        if (template[i] === undefined || template[i] === null) {
            propsToRemove.push(i);
        }
        else if (Array.isArray(template[i])
            || template[i] instanceof Object) {
            removeNullValuesFromTemplate(template[i]);
        }
    }
    for (let i in propsToRemove) {
        delete template[propsToRemove[i]];
    }
    return template;
}
