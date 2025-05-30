"use strict";
Object.defineProperty(exports, "__esModule", { value: !0 }),
  (exports.httpRequest =
    exports.invokeFunction =
    exports.startExecution =
      void 0);
const https = require("https"),
  client_lambda_1 = require("@aws-sdk/client-lambda"),
  client_sfn_1 = require("@aws-sdk/client-sfn"),
  FRAMEWORK_HANDLER_TIMEOUT = 9e5,
  awsSdkConfig = { httpOptions: { timeout: FRAMEWORK_HANDLER_TIMEOUT } };
async function defaultHttpRequest(options, requestBody) {
  return new Promise((resolve, reject) => {
    try {
      const request = https.request(options, (response) => {
        response.resume(),
          !response.statusCode || response.statusCode >= 400
            ? reject(
                new Error(`Unsuccessful HTTP response: ${response.statusCode}`),
              )
            : resolve();
      });
      request.on("error", reject), request.write(requestBody), request.end();
    } catch (e) {
      reject(e);
    }
  });
}
let sfn, lambda;
async function defaultStartExecution(req) {
  return (
    sfn || (sfn = new client_sfn_1.SFN(awsSdkConfig)), sfn.startExecution(req)
  );
}
async function defaultInvokeFunction(req) {
  lambda || (lambda = new client_lambda_1.Lambda(awsSdkConfig));
  try {
    return await lambda.invoke(req);
  } catch {
    return (
      await (0, client_lambda_1.waitUntilFunctionActiveV2)(
        { client: lambda, maxWaitTime: 300 },
        { FunctionName: req.FunctionName },
      ),
      lambda.invoke(req)
    );
  }
}
(exports.startExecution = defaultStartExecution),
  (exports.invokeFunction = defaultInvokeFunction),
  (exports.httpRequest = defaultHttpRequest);
