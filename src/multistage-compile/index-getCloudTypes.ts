import * as fs from 'fs';
const CLOUD_TYPE_NAME = 'cloudtype';
const MANAGED_BY_KEY = 'managedBy';
const MANAGED_BY_VALUE = 'monode';

const trimTsExtension = function(tsFilePath: string): string {
  return tsFilePath.substring(0, tsFilePath.length - 3);
}

let cloudTypeConfigByName: { [key: string]: any } = {}
let logs = 'Compilation Logs:\n';

// @ts-ignore
for (let i in FILES_BY_FILE_TYPE[CLOUD_TYPE_NAME]) {
  try {
    // @ts-ignore
    const filePath = trimTsExtension(FILES_BY_FILE_TYPE[CLOUD_TYPE_NAME][i]);
    const ctExports = require(filePath);
    for (const key in ctExports) {
      if (ctExports?.[key]?.cloudTypeName) {
        cloudTypeConfigByName[ctExports?.[key]?.cloudTypeName] = ctExports;
        break;
      }
    }
    // @ts-ignore
    logs += ` + Cloud Type: "${FILES_BY_FILE_TYPE[CLOUD_TYPE_NAME][i]}".\n`;
  } catch(e: any) {
    // @ts-ignore
    logs += ` ! ERROR when reading in cloud type "${FILES_BY_FILE_TYPE[CLOUD_TYPE_NAME][i]}": ${e.toString()}\n`;
  }
}

const allCloudFormationExports = {
  functions: ({} as any),
  resources: ({} as any),
}

// Read in all cloud config from project files
for (let cloudTypeName in cloudTypeConfigByName) {
  // @ts-ignore
  for (let pathIndex in FILES_BY_FILE_TYPE[cloudTypeName]) {
    try {
      // @ts-ignore
      const filePath = trimTsExtension(FILES_BY_FILE_TYPE[cloudTypeName][pathIndex]);
      const cloudTypeExports = require(filePath);

      // Copy cloud config
      if (cloudTypeExports?.default) {
        let newCloudFormationExports = cloudTypeExports?.default?.cloudFormationExports;
        // Copy functions
        for (let functionName in newCloudFormationExports?.functions) {
          allCloudFormationExports.functions[functionName] = newCloudFormationExports?.functions[functionName];
        }

        // Copy resources
        for (let resourceName in newCloudFormationExports?.resources) {
          allCloudFormationExports.resources[resourceName] = newCloudFormationExports?.resources[resourceName];
        }
      }
      // @ts-ignore
      logs += ` + Cloud Component: "${FILES_BY_FILE_TYPE[cloudTypeName][pathIndex]}".\n`;
    } catch(e: any) {
      // @ts-ignore
      logs += ` ! ERROR when reading in cloud component config "${FILES_BY_FILE_TYPE[cloudTypeName][pathIndex]}": ${e.toString()}\n`;
    }
  }
}


// Read in the serverless config
let serverlessConfig = JSON.parse(fs.readFileSync(`../serverless-project/serverless.json`).toString());

// Delete the old cloud resources
let resourcesToDelete: string[] = [];
for (let resourceName in serverlessConfig.resources.Resources) {
  if (serverlessConfig.resources.Resources[resourceName][MANAGED_BY_KEY] == MANAGED_BY_VALUE) {
    resourcesToDelete.push(resourceName);
  }
}
for (let resourceName in resourcesToDelete) {
  delete serverlessConfig.resources.Resources[resourceName];
}

// Add the new resources
for (let resourceName in allCloudFormationExports?.resources) {
  let newResource = allCloudFormationExports?.resources[resourceName];
  newResource[MANAGED_BY_KEY] = MANAGED_BY_VALUE;
  serverlessConfig.resources.Resources[resourceName] = newResource;
}
fs.writeFileSync(`../serverless-project/serverless.json`, JSON.stringify(serverlessConfig, null, 2));



// Write the logs
fs.writeFileSync(`${__dirname}/mnd_compile_logs.txt`, logs);
