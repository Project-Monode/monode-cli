const promisify = require('util').promisify;
const exec = require('child_process').exec;

// Run the command
const runCmdAsyncCallback = async function({ command, path }: any, callback: any) {
  const process = exec(command, { cwd: path }, callback); 
  process.stdout.on('data', (data: any) => { console.log(data.toString()); });
}

// Wrapper for the command
export async function runCmdAsync({ command, path = process.cwd(), shouldPrintLogs = false }: any) {
  if (shouldPrintLogs) {
    console.log(`Running: $ ${command}`);
    console.log(`in ${path}`);
  }
  await promisify(runCmdAsyncCallback)({ command, path}).catch((error: any) => {
    console.log(error);
  });
}