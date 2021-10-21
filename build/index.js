#!/usr/bin/env node
"use strict";
/* TODO: Run command -v or something like that on all dependencies, and notify
 * the user if any of them are not installed. */
// Make "tke add" add chunks to existing projects
Object.defineProperty(exports, "__esModule", { value: true });
// Dependencies
const CLI_VERSION = "0.0.0";
const commander_1 = require("commander");
const performMultistageCompile_1 = require("./src/multistage-compile/performMultistageCompile");
//TsNode.create().compile(fs.readFileSync('./src/test.ts').toString(), 'test.ts')
commander_1.program.version(CLI_VERSION, "-v", "Output the version number")
    .description("Performs a number of common Monode operations.");
commander_1.program.command("compile [path-to-project-root]")
    .description("Compile a monode project as a serverless project. Default path is \"./\"")
    .action(async function (pathToProjectRoot) {
    await (0, performMultistageCompile_1.performMultistageCompile)({
        relativePath: pathToProjectRoot !== null && pathToProjectRoot !== void 0 ? pathToProjectRoot : './',
    });
});
commander_1.program.parse(process.argv);
