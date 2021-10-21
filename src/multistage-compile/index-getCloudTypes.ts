const fs = require('fs');

let cloudTypeConfigByName: { [key: string]: any } = {}

// @ts-ignore
for (let i in CLOUD_TYPE_DEFINITION_FILES) {
  try {
    // @ts-ignore
    const filePath = CLOUD_TYPE_DEFINITION_FILES[i].substring(0,CLOUD_TYPE_DEFINITION_FILES[i].length - 3);
    const ctExports = require(filePath);
    if (ctExports?.cloudTypeConfig) {
      cloudTypeConfigByName[ctExports?.cloudTypeConfig?.cloudTypeName] = ctExports?.cloudTypeConfig
    } else {
      // TODO: log the errors to a file.
    }
  } catch(e: any) {
    // TODO: log the errors to a file.
  }
}

fs.writeFileSync(`${__dirname}/getCloudTypesJson.json`, JSON.stringify(cloudTypeConfigByName, null, 2));
