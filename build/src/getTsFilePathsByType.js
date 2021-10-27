"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTsFilePathsByType = void 0;
const fs = require("fs");
const path = require("path");
const FILES_TO_IGNORE = [
    `node_modules`,
];
/// Gets all the Typescript files in a directory and sorts them by their cloud type something.cloudTypeName.ts
const getTsFilePathsByType = function (relativePath) {
    if (relativePath === null || relativePath === undefined) {
        relativePath = './';
    }
    let filePathsByType = {};
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
                let filePathsInDirectoryByType = (0, exports.getTsFilePathsByType)(relativeFilePath);
                for (let fileType in filePathsInDirectoryByType) {
                    if (filePathsByType[fileType] === null || filePathsByType[fileType] === undefined) {
                        filePathsByType[fileType] = [];
                    }
                    for (let i in filePathsInDirectoryByType[fileType]) {
                        filePathsByType[fileType].push(filePathsInDirectoryByType[fileType][i]);
                    }
                }
                // Add TS files
            }
            else if (fileName.endsWith(".ts")) {
                const fileNameParts = fileName.split('.');
                let fileType = '';
                if (fileNameParts.length > 2) {
                    fileType = fileNameParts[fileNameParts.length - 2];
                }
                if (filePathsByType[fileType] === null || filePathsByType[fileType] === undefined) {
                    filePathsByType[fileType] = [];
                }
                filePathsByType[fileType].push(relativeFilePath);
            }
        }
    });
    // Return the list of paths
    return filePathsByType;
};
exports.getTsFilePathsByType = getTsFilePathsByType;
