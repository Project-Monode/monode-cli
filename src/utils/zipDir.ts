import * as fs from 'fs';
import * as path from 'path';

/// Zips the given dir and exports it to the given location
export const zipDir = async function(args: { inputPath: string, outputPath: string }) {
  const archive = require('simple-archiver').archive;
  const filesToArchive: any[] = [];
  const allFiles = fs.readdirSync(args.inputPath);
  allFiles.forEach(
    function(fileName: string) {
      const relativeFilePath =
        args.inputPath +
        (args.inputPath.endsWith('/') ? '' : '/') +
        fileName;
      filesToArchive.push({
        data: relativeFilePath,
        type: fs.statSync(path.resolve(relativeFilePath)).isDirectory() ? 'directory' : 'file',
        name: fileName,
      });
    }
  );
  await archive(filesToArchive, { format: 'zip', output: args.outputPath })
}