import { CloudComponentType, CloudComponent, buildResourceName } from 'monode-serverless';

// Allow a variable number of IAm permissions
type OneOrMore<SubType> = SubType | SubType[];

// This is the format we need http-triggered lambdas to return
export interface LambdaHttpResponse<BodyType> {
  statusCode: number,
  body: BodyType,
}


/// This is how lambda functions will be defined
export const HttpTriggeredLambda = CloudComponentType.defineNew({
  defineNew<ParamType, ReturnType>(args: {
    functionName: string,
    httpVerb: string,
    iamPermissions: OneOrMore<{ [key: symbol | string]: any }>[],
    function: (args: ParamType) => Promise<LambdaHttpResponse<ReturnType>>,
  }) {
    const roleName = args.functionName + 'IamRole';
    const policyName = args.functionName + 'IamPolicy';
    const allIamStatements: any[] = [];
    // Compile the list of permissions for this function
    for (let i in args.iamPermissions) {
      if (Array.isArray(args.iamPermissions[i])) {
        for (let j in args.iamPermissions[i]) {
          allIamStatements.push((args.iamPermissions[i] as any[])[j as any]);
        }
      } else {
        allIamStatements.push(args.iamPermissions[i]);
      }
    }

    // Define the serverless/CloudFormation config for this resource
    return CloudComponent.defineNew({
      function: args.function,
      cloudFormationExports: {
        // Define the function
        functions: {
          [args.functionName]: {
            handler: undefined,
            name: buildResourceName(args.functionName),
            role: 'MONODE' + roleName,
            events:[
              {
                http:{
                  path: args.functionName,
                  method: args.httpVerb,
                  cors: true,
                  private: true,
                }
              }
            ]
          },
        },

        // Define the IAM role for this function
        resources: {
          [roleName]: {
            "Type": "AWS::IAM::Role",
            "Properties": {
              "AssumeRolePolicyDocument": {
                "Version": "2012-10-17",
                "Statement": [
                  {
                    "Effect": "Allow",
                    "Principal": {
                      "Service": [ "lambda.amazonaws.com" ]
                    },
                    "Action": "sts:AssumeRole",
                  }
                ],
              },
              "Policies": [
                {
                  "PolicyName": policyName,
                  "PolicyDocument": {
                    "Version": "2012-10-17",
                    "Statement": allIamStatements,
                  }
                }
              ]
            }
          }
        }
      },

      // Define what the lambda handler for this function will look like.
      // Note that the http event is automatically parsed and the result automatically has CORS headers added.
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
    });
  }
});
