"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lambda = void 0;
const monode_serverless_1 = require("monode-serverless");
/// This is how lambda functions will be defined
exports.Lambda = monode_serverless_1.CloudType.defineNew({
    // All lambda files should be named "${FunctionName}.lambda.ts"
    cloudTypeName: 'lambda',
    defineNew(args) {
        return {
            function: args.function,
            cloudFormationExports: {
                functions: {
                    [args.functionName]: {
                        handler: undefined,
                        events: [
                            {
                                http: {
                                    path: args.functionName,
                                    method: "any",
                                    cors: true,
                                    private: true
                                }
                            }
                        ]
                    },
                },
            },
            buildHandlerEntry(args) {
                return `exports.${args.functionName} = async (event, context, callback) => {
  event = JSON.parse(event.body);
  let result = await require('${args.filePath}').default.function(event);
  return {
    headers: {
      'Content-Type': 'application/jason',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: 200,
    body: JSON.stringify(result)
  };
};\n`;
            }
        };
    }
});
