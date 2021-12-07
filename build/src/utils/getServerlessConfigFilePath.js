"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServerlessConfigFilePath = void 0;
const fs = require("fs");
const path = require("path");
const getServerlessConfigFilePath = function (serverlessPathAbsolute) {
    const serverlessJsonPath = path.resolve(serverlessPathAbsolute, `serverless.json`);
    if (fs.existsSync(serverlessJsonPath)) {
        return serverlessJsonPath;
    }
    const serverlessYamlPath = path.resolve(serverlessPathAbsolute, `serverless.yaml`);
    if (fs.existsSync(serverlessYamlPath)) {
        return serverlessYamlPath;
    }
    const serverlessYmlPath = path.resolve(serverlessPathAbsolute, `serverless.yml`);
    if (fs.existsSync(serverlessYmlPath)) {
        return serverlessYmlPath;
    }
    throw ('Error! Could not find a serverless config file in the given directory!');
};
exports.getServerlessConfigFilePath = getServerlessConfigFilePath;
