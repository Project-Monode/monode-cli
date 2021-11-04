#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
const CLI_VERSION = "0.0.0";
const commander_1 = require("commander");
const performMultistageCompile_1 = require("./src/multistage-compile/performMultistageCompile");
const run_cmd_1 = require("./src/utils/run-cmd");
const path = require("path");
// CLI Definition
commander_1.program.version(CLI_VERSION, "-v", "Output the version number")
    .description("Performs a number of common Monode operations.");
commander_1.program.command("compile [path-to-project-root]")
    .description("Compile a monode project as a serverless project. Default path is \"./\"")
    .action(async function (pathToProjectRoot) {
    await (0, performMultistageCompile_1.performMultistageCompile)({
        relativePath: pathToProjectRoot !== null && pathToProjectRoot !== void 0 ? pathToProjectRoot : './',
    });
});
commander_1.program.command("deploy [path-to-project-root]")
    .description("Deploy a monode project to AWS through serverless. Default path is \"./\"")
    .action(async function (pathToProjectRoot) {
    pathToProjectRoot = pathToProjectRoot !== null && pathToProjectRoot !== void 0 ? pathToProjectRoot : './';
    await (0, performMultistageCompile_1.performMultistageCompile)({
        relativePath: pathToProjectRoot,
    });
    await (0, run_cmd_1.runCmdAsync)({
        command: 'serverless deploy',
        path: path.resolve(pathToProjectRoot, '../serverless-project'),
        shouldPrintLogs: true,
    });
});
commander_1.program.parse(process.argv);
