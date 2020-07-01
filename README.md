# Swagger UI AWS API Gateway

This module is branched from [swagger-ui-express](https://www.npmjs.com/package/swagger-ui-express). It allows you to serve auto-generated [swagger-ui](https://swagger.io/tools/swagger-ui/) generated API docs from the AWS API Gateway. It uses Lambda functions to generate the API docs based on a `swagger.json` or `swagger.yaml` file. The result is living documentation for your API hosted on your AWS API Gateway.

Swagger version is pulled from npm module swagger-ui-dist. Please use a lock file or specify the version of swagger-ui-dist you want to ensure it is consistent across environments.

You may be also interested in:

* [swagger tools](https://github.com/swagger-api): Various tools, including swagger editor, swagger code gen etc.

## Usage

Install using npm:

```bash
$ npm install swagger-ui-aws-apigateway
```

Configure your API Gateway:
* Create a resource of type "proxy resource"
* Create a method ANY
* Create a lambda function of type "LAMBDA_PROXY"

In your AWS lambda function, include this package as follows:

```javascript
const swaggerUi = require('swagger-ui-aws-apigateway');
const fs = require('fs');

// read your yaml file and initialize
const swaggerDocument = fs.readFileSync('./interface/service_interface.yaml');
var swaggerHandler = swaggerUi.setup(swaggerDocument);

// call the swagger api doc in your handler

exports.handler = (event, context, callback) => {

   if (event.path.includes("/api-docs")) {
        console.log("Got request to the api docs.");
        swaggerHandler(event, context, callback);
        return;
    }

    // ... your other code ...

}
```

## Restrictions

Currently the path in the url must be named "api-docs".

## Requirements

* Node v0.10.32 or above

