#!/usr/bin/env node

// Dependencies
const CLI_VERSION = "0.0.0";
import { program } from 'commander';
import { performMultistageCompile } from './src/multistage-compile/performMultistageCompile';
import { runCmdAsync } from './src/utils/run-cmd';
import * as path from 'path';

// CLI Definition
program.version(CLI_VERSION, "-v", "Output the version number")
  .description("Performs a number of common Monode operations.");
program.command("compile [path-to-project-root]")
  .description("Compile a monode project as a serverless project. Default path is \"./\"")
  .action(async function(pathToProjectRoot?: string) {
    await performMultistageCompile({
      relativePath: pathToProjectRoot ?? './',
    });
  });
program.command("deploy [path-to-project-root]")
  .description("Deploy a monode project to AWS through serverless. Default path is \"./\"")
  .action(async function(pathToProjectRoot?: string) {
    pathToProjectRoot = pathToProjectRoot ?? './';
    await performMultistageCompile({
      relativePath: pathToProjectRoot,
    });
    await runCmdAsync({
      command: 'serverless deploy',
      path: path.resolve(pathToProjectRoot, '../serverless-project'),
      shouldPrintLogs: true,
    })
  });
program.parse(process.argv);