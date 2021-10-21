#!/usr/bin/env node

/* TODO: Run command -v or something like that on all dependencies, and notify
 * the user if any of them are not installed. */
// Make "tke add" add chunks to existing projects

// Dependencies
const CLI_VERSION = "0.0.0";
import { program } from 'commander';
//import * as TsNode from 'ts-node';
import * as fs from 'fs';
import { performMultistageCompile } from './src/multistage-compile/performMultistageCompile';
//TsNode.create().compile(fs.readFileSync('./src/test.ts').toString(), 'test.ts')

program.version(CLI_VERSION, "-v", "Output the version number")
  .description("Performs a number of common Monode operations.");
program.command("compile [path-to-project-root]")
  .description("Compile a monode project as a serverless project. Default path is \"./\"")
  .action(async function(pathToProjectRoot?: string) {
    await performMultistageCompile({
      relativePath: pathToProjectRoot ?? './',
    });
  });
program.parse(process.argv);