import * as fs from 'fs';
import * as path from 'path';

export const getServerlessConfigFilePath = function(serverlessPathAbsolute: string) {
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
  throw('Error! Could not find a serverless config file in the given directory!');
}