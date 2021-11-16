#!/usr/bin/env node

// Dependencies
const CLI_VERSION = "0.0.0";
import { program } from 'commander';
import { performMultistageCompile } from './src/multistage-compile/performMultistageCompile';
import { performInit } from './src/init/performInit';

// CLI Definition
program.version(CLI_VERSION, "-v", "Output the version number")
  .description("Performs a number of common Monode operations.");
program.command("compile [path-to-project-root]")
  .description("Compile a Monode project as a serverless project. Default path is \"./\"")
  .action(async function(pathToProjectRoot?: string) {
    await performMultistageCompile({
      relativePath: pathToProjectRoot ?? './',
    });
  });
program.command("init")
  .description("Creates a Monode project in the current directory.")
  .action(async function() {
    performInit();
  });
program.parse(process.argv);