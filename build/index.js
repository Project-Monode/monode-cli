#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
const CLI_VERSION = "0.0.0";
const commander_1 = require("commander");
const performInit_1 = require("./src/init/performInit");
const performMultistageCompile_1 = require("./src/multistage-compile/performMultistageCompile");
const cloneDirectroyStructure_1 = require("./src/utils/cloneDirectroyStructure");
// CLI Definition
commander_1.program.version(CLI_VERSION, "-v", "Output the version number")
    .description("Performs a number of common Monode operations.");
commander_1.program.command("compile [path-to-project-root]")
    .description("Compile a Monode project as a serverless project. Default path is \"./\"")
    .action(async function (pathToProjectRoot) {
    await (0, performMultistageCompile_1.performMultistageCompile)({
        relativePath: pathToProjectRoot !== null && pathToProjectRoot !== void 0 ? pathToProjectRoot : './',
    });
});
commander_1.program.command("init")
    .description("Creates a Monode project in the current directory.")
    .action(async function () {
    (0, performInit_1.performInit)();
});
commander_1.program.command("temp")
    .description("Creates a Monode project in the current directory.")
    .action(async function () {
    (0, cloneDirectroyStructure_1.cloneDirectroyStructure)('./src', './tempSrc');
    /*console.log(getFileDependencies({
      sourceFilePath: 'test.ts',
      allDependencies: [],
    }));*/
});
commander_1.program.parse(process.argv);
