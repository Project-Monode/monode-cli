"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipDir = void 0;
const fs = require("fs");
const path = require("path");
/// Zips the given dir and exports it to the given location
const zipDir = async function (args) {
    const archive = require('simple-archiver').archive;
    const filesToArchive = [];
    const allFiles = fs.readdirSync(args.inputPath);
    allFiles.forEach(function (fileName) {
        const relativeFilePath = args.inputPath +
            (args.inputPath.endsWith('/') ? '' : '/') +
            fileName;
        filesToArchive.push({
            data: relativeFilePath,
            type: fs.statSync(path.resolve(relativeFilePath)).isDirectory() ? 'directory' : 'file',
            name: fileName,
        });
    });
    await archive(filesToArchive, { format: 'zip', output: args.outputPath });
};
exports.zipDir = zipDir;
