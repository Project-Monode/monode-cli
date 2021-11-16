import { CloudType } from 'monode-serverless';

/// This is how lambda functions will be defined
export const Lambda = CloudType.defineNew({
  // All lambda files should be named "${FunctionName}.lambda.ts"
  cloudTypeName: 'lambda',
  defineNew<ParamType, ReturnType>(args: {
    functionName: string,
    triggers: string[],
    function: (args: ParamType) => ReturnType,
  }) {
    return {
      function: args.function,
      cloudFormationExports: {
        functions: {
          [args.functionName]: {
            handler: undefined,
            events:[
              {
                http:{
                  path: args.functionName,
                  method: "any",
                  cors:true,
                  private:true
                }
              }
            ]
          },
        },
      },
      buildHandlerEntry(args: { functionName: string, filePath: string, }) {
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