"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCmdAsync = void 0;
const promisify = require('util').promisify;
const exec = require('child_process').exec;
// Run the command
const runCmdAsyncCallback = async function ({ command, path }, callback) {
    const process = exec(command, { cwd: path }, callback);
    process.stdout.on('data', (data) => { console.log(data.toString()); });
};
// Wrapper for the command
async function runCmdAsync({ command, path = process.cwd(), shouldPrintLogs = false }) {
    if (shouldPrintLogs) {
        console.log(`Running: $ ${command}`);
        console.log(`in ${path}`);
    }
    await promisify(runCmdAsyncCallback)({ command, path }).catch((error) => {
        console.log(error);
    });
}
exports.runCmdAsync = runCmdAsync;
