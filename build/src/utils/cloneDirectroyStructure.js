"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cloneDirectroyStructure = void 0;
const fs = require("fs");
const path = require("path");
function cloneDirectroyStructure(sourcePath, outputPath) {
    // Look at each file
    let files = fs.readdirSync(path.resolve(sourcePath));
    console.log(files);
    files.forEach(function (fileName) {
        const subPathSource = path.resolve(sourcePath, fileName);
        const subPathOutput = path.resolve(outputPath, fileName);
        if (fs.statSync(subPathSource).isDirectory()) {
            fs.mkdirSync(subPathOutput);
            cloneDirectroyStructure(subPathSource, subPathOutput);
        }
    });
}
exports.cloneDirectroyStructure = cloneDirectroyStructure;
