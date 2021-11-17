"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileDependencies = void 0;
const ts = require("typescript");
const fs = require("fs");
const path = require("path");
/// Recursively gets all of a TypeScript file's dependencies
/// Note: only works with "import" based dependencies.
const getFileDependencies = function (args) {
    const sourceDirectoryPath = path.resolve(args.sourceFilePath, '../');
    const sourceFileName = path.basename(args.sourceFilePath);
    const sourceText = fs.readFileSync(args.sourceFilePath).toString();
    const sourceFileTs = ts.createSourceFile(sourceFileName, sourceText, ts.ScriptTarget.ES2017);
    sourceFileTs.statements.forEach(function (statement) {
        if (ts.isImportDeclaration(statement)) {
            const importText = statement.moduleSpecifier.text;
            if (importText.startsWith(`.`)) {
                const relativePath = importText + `.ts`;
                const absolutePath = path.resolve(sourceDirectoryPath, relativePath);
                if (!args.allDependencies.includes(absolutePath)) {
                    args.allDependencies.push(absolutePath);
                    args.allDependencies = (0, exports.getFileDependencies)({
                        sourceFilePath: absolutePath,
                        allDependencies: args.allDependencies,
                    });
                }
            }
        }
    });
    return args.allDependencies;
};
exports.getFileDependencies = getFileDependencies;
