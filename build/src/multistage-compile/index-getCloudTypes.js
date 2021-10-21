"use strict";
var _a;
const fs = require('fs');
let cloudTypeConfigByName = {};
// @ts-ignore
for (let i in CLOUD_TYPE_DEFINITION_FILES) {
    try {
        // @ts-ignore
        const filePath = CLOUD_TYPE_DEFINITION_FILES[i].substring(0, CLOUD_TYPE_DEFINITION_FILES[i].length - 3);
        const ctExports = require(filePath);
        if (ctExports === null || ctExports === void 0 ? void 0 : ctExports.cloudTypeConfig) {
            cloudTypeConfigByName[(_a = ctExports === null || ctExports === void 0 ? void 0 : ctExports.cloudTypeConfig) === null || _a === void 0 ? void 0 : _a.cloudTypeName] = ctExports === null || ctExports === void 0 ? void 0 : ctExports.cloudTypeConfig;
        }
        else {
            // TODO: log the errors to a file.
        }
    }
    catch (e) {
        // TODO: log the errors to a file.
    }
}
fs.writeFileSync(`${__dirname}/getCloudTypesJson.json`, JSON.stringify(cloudTypeConfigByName, null, 2));
