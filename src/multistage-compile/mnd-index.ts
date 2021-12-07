import * as fs from 'fs';
const YAML = require('yamljs');
const MANAGED_BY_MONODE_TAG = 'MONODE';

const trimTsExtension = function(tsFilePath: string): string {
  return tsFilePath.substring(0, tsFilePath.length - 3);
}

let logs = 'Compilation Logs:\n';

const allCloudFormationExports = {
  functions: ({} as any),
  resources: ({} as any),
}

let lambdaHandlers_file = `process.env.service = \"${process.env.service}\";\nprocess.env.stage = \"${process.env.stage}\";\nprocess.env.region = \"${process.env.region}\";\n`;

// @ts-ignore
for (let i in ALL_TS_FILE_PATHS) {
  try {
    // @ts-ignore
    const filePath = trimTsExtension(ALL_TS_FILE_PATHS[i]);
    const fileExports = require(filePath);
    for (let exportKey in fileExports) {
      if (fileExports[exportKey]?.isMonodeCloudComponent) {
        let newCloudFormationExports = fileExports[exportKey]?.cloudFormationExports;
  
        // Copy functions
        for (let functionName in newCloudFormationExports?.functions) {
          allCloudFormationExports.functions[functionName] = newCloudFormationExports?.functions[functionName];
          lambdaHandlers_file += fileExports[exportKey]?.buildHandlerEntry({ functionName: functionName, filePath: filePath });
        }
  
        // Copy resources
        for (let resourceName in newCloudFormationExports?.resources) {
          allCloudFormationExports.resources[resourceName] = newCloudFormationExports?.resources[resourceName];
        }

        // @ts-ignore
        logs += ` + Cloud Component: { ${exportKey} } in "${ALL_TS_FILE_PATHS[i]}"\n`;
      }
    }
  } catch(e: any) {
    // @ts-ignore
    logs += ` ! ERROR when reading in cloud component config "${ALL_TS_FILE_PATHS[i]}": ${e.toString()}\n`;
  }
}


// Read in the serverless config
let serverlessConfig: any;
// @ts-ignore
let configIsJson = SERVERLESS_PATH.endsWith('json');
if (configIsJson) {
  // @ts-ignore
  serverlessConfig = JSON.parse(fs.readFileSync(SERVERLESS_PATH).toString());
} else {
  // @ts-ignore
  serverlessConfig = YAML.parse(fs.readFileSync(SERVERLESS_PATH).toString());
}

// Delete the old functions and resources
let functionsToDelete: string[] = [];
for (let functionName in serverlessConfig.functions) {
  if (functionName.startsWith(MANAGED_BY_MONODE_TAG)) {
    functionsToDelete.push(functionName);
  }
}
for (let i in functionsToDelete) {
  delete serverlessConfig.functions[functionsToDelete[i]];
}
let resourcesToDelete: string[] = [];
for (let resourceName in serverlessConfig.resources?.Resources) {
  if (resourceName.startsWith(MANAGED_BY_MONODE_TAG)) {
    resourcesToDelete.push(resourceName);
  }
}
for (let i in resourcesToDelete) {
  delete serverlessConfig.resources?.Resources[resourcesToDelete[i]];
}

// Add the new functions resources
if (!serverlessConfig.functions) {
  serverlessConfig.functions = {} as any;
}
for (let functionName in allCloudFormationExports?.functions) {
  let newFunction = allCloudFormationExports?.functions[functionName];
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
  serverlessConfig.resources = {} as any;
}
if (!serverlessConfig.resources.Resources) {
  serverlessConfig.resources.Resources = {} as any;
} 
for (let resourceName in allCloudFormationExports?.resources) {
  serverlessConfig.resources.Resources[`${MANAGED_BY_MONODE_TAG}${resourceName}`]
    = allCloudFormationExports?.resources[resourceName];
}

// Write the serverless config
serverlessConfig = removeNullValuesFromTemplate(serverlessConfig);
if (configIsJson) {
  // @ts-ignore
  fs.writeFileSync(SERVERLESS_PATH, JSON.stringify(serverlessConfig, null, 2));
} else {
  // @ts-ignore
  fs.writeFileSync(SERVERLESS_PATH, YAML.stringify(serverlessConfig, 1024, 2));
}



// Export the lambda handlers file
fs.writeFileSync(`${__dirname}/mnd_lambda_handlers.js`, lambdaHandlers_file);



// Write the logs
fs.writeFileSync(`${__dirname}/mnd_compile_logs.txt`, logs);



function removeNullValuesFromTemplate(template: any) {
  let propsToRemove: string[] = [];
  for (let i in template) {
    if (template[i] === undefined || template[i] === null) {
      propsToRemove.push(i);
    } else if (
      Array.isArray(template[i])
      || template[i] instanceof Object
    ) {
      removeNullValuesFromTemplate(template[i]);
    }
  }
  for (let i in propsToRemove) {
    delete template[propsToRemove[i]];
  }
  return template;
}
