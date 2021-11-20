import { CloudType, buildResourceName } from 'monode-serverless';

/// This is how lambda functions will be defined
export const Lambda = CloudType.defineNew({
  // All lambda files should be named "${FunctionName}.lambda.ts"
  cloudTypeName: 'lambda',
  defineNew<ParamType, ReturnType>(args: {
    functionName: string,
    triggers: string[],
    function: (args: ParamType) => Promise<LambdaHttpResponse<ReturnType>>,
  }) {
    return {
      function: args.function,
      cloudFormationExports: {
        functions: {
          [args.functionName]: {
            handler: undefined,
            name: buildResourceName(args.functionName),
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
      'Content-Type': 'application/json',
      'Access-Control-Allow-Methods': '*',
      'Access-Control-Allow-Origin': '*',
    },
    statusCode: result.statusCode,
    body: JSON.stringify(result.body)
  };
};\n`;
      }
    };
  }
});



export interface LambdaHttpResponse<BodyType> {
  statusCode: number,
  body: BodyType,
}
