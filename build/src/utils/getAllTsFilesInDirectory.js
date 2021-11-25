"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllTsFilesInDirectory = void 0;
const fs = require("fs");
const path = require("path");
const FILES_TO_IGNORE = [
    `node_modules`,
];
/// Gets all the Typescript files in a directory and sorts them by their cloud type something.cloudTypeName.ts
const getAllTsFilesInDirectory = function (relativePath) {
    if (relativePath === null || relativePath === undefined) {
        relativePath = './';
    }
    let filePaths = [];
    // Look at each file
    let files = fs.readdirSync(path.resolve(relativePath));
    files.forEach(fileName => {
        const relativeFilePath = relativePath +
            (relativePath.endsWith('/') ? '' : '/') +
            fileName;
        // Some files should not be included in the library
        if (!FILES_TO_IGNORE.includes(fileName)) {
            // Recurssively add TS files in subdirectories
            if (fs.statSync(path.resolve(relativeFilePath)).isDirectory()) {
                let filePathsInDirectory = (0, exports.getAllTsFilesInDirectory)(relativeFilePath);
                for (let i in filePathsInDirectory) {
                    filePaths.push(filePathsInDirectory[i]);
                }
                // Add TS files
            }
            else if (fileName.endsWith(".ts")) {
                filePaths.push(relativeFilePath);
            }
        }
    });
    // Return the list of paths
    return filePaths;
};
exports.getAllTsFilesInDirectory = getAllTsFilesInDirectory;
