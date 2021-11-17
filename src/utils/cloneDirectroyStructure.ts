import * as fs from 'fs';
import * as path from 'path';

export function cloneDirectroyStructure(sourcePath: string, outputPath: string) {
  // Look at each file
  let files = fs.readdirSync(path.resolve(sourcePath));
  console.log(files);
  files.forEach(
    function (fileName) {
      const subPathSource = path.resolve(sourcePath, fileName);
      const subPathOutput = path.resolve(outputPath, fileName);
      if (fs.statSync(subPathSource).isDirectory()) {
        fs.mkdirSync(subPathOutput);
        cloneDirectroyStructure(subPathSource, subPathOutput);
      }
    }
  );
}