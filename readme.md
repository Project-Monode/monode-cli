# Monode CLI
Call using `$ mnd` or `$ monode`.

### Installation
 - `$ npm i -g .`

### Usage
 - Create a folder for your Monode project.
 - Open a command terminal in the new Monode project folder and run `$ monode init`.
 - Open `monode.json` and set `"relativePathToServerless": ______` to the relative path to your serverless project.
 - Update your serverless build scripts to run `$ monode compile` in the monode project directory before compiling and deploying your serverless project to the cloud.
 - [Click here for documentation on using the Monode library.](https://www.npmjs.com/package/monode-serverless)

### External Dependencies
 - The Monode CLI depends on the `npm` and `node` CLIs.
