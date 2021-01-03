# AWS Serverless Swagger UI

This module allows you to serve auto-generated [swagger-ui](https://swagger.io/tools/swagger-ui/) API docs 
from the AWS API Gateway. 
It uses Lambda functions to generate the API docs based on a swagger/open-api yaml file. 
The result is living documentation for your API hosted on your AWS API Gateway.

Initially based upon [swagger-ui-aws-apigateway](https://github.com/klauslochmann/swagger-ui-aws-apigateway),
this version focus on :
* simplify the code base.
* speed up rendering
* update code with ES6 syntax including async handler.
* reduce the number of HTTP requests.
* accept any filename in `.yaml` for the definition, not only `interface.yaml`.
* allow the path to be whatever you want, not limited to `/api-docs` (see [Restrictions](#restrictions)).
* fix media files rendering in base64.

## Install

```bash
npm install aws-serverless-swagger-ui
```

## Usage

Configure your API Gateway:
* Create a resource which will serve your sagger UI (ex: /docs)
* Create a resource of type "proxy resource" (ex: /docs/{proxy+})
* Create a method ANY
* Create a lambda function of type "LAMBDA_PROXY"

In your AWS lambda function, include this package as follows:

```javascript
const swaggerUi = require('aws-serverless-swagger-ui');
const swaggerHandler = swaggerUi.setup('swagger.yaml');


exports.handler = async (event, context, callback) => {
    return (await swaggerHandler)(event, context, callback);
}
```

Once deployed, access your swagger ui at : `https://your-api-gateway-endpoint/your-mount-path/index.html`


## Restrictions

Because API Gateway doesn't match the root folder with {proxy+} definition, your default URL should contain index.html.
We suggest creating a mock integration on your main folder to return a 301. (ex: /docs => 301 => /docs/index.html)

## Logs

You can print some logs by setting the Environment Variable `DEBUG`