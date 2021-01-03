'use strict'

const fs = require('fs').promises;
const path = require('path');
const swaggerUi = require('swagger-ui-dist');
const absolutePath = swaggerUi.getAbsoluteFSPath();
const debug = (msg) => {
    process.env.DEBUG ? console.log(msg) : null
}

const htmlTplString = (swaggerUiInit, faviconEncoded) => `
<!-- HTML for static distribution bundle build -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css" >
  <link rel="icon" href="data:image/png;base64,${faviconEncoded}" />
  <style>
    html
    {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    
    *,
    *:before,
    *:after
    {
      box-sizing: inherit;
    }

    body {
      margin:0;
      background: #fafafa;
    }
  </style>
</head>

<body>

<div id="swagger-ui"></div>

<script src="./swagger-ui-bundle.js"> </script>
<script src="./swagger-ui-standalone-preset.js"> </script>
<script>
${swaggerUiInit}
</script>

</body>
</html>
`;

const jsTplString = (url) => `
window.onload = function() {
  const ui = SwaggerUIBundle({
    url: '${url}',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  });

  window.ui = ui
}
`;

const contentType = (ext) => {
    switch (ext) {
        case '.js':
            return 'application/javascript';
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        default:
            return 'text/plain';
    }
}

const generateHTML = async (swaggerFile) => {
    const swaggerInit = jsTplString(swaggerFile)

    const favicon = await fs.readFile(`${absolutePath}/favicon-32x32.png`)
    const faviconEncoded = Buffer.from(favicon).toString('base64');

    return htmlTplString(swaggerInit, faviconEncoded)
};


const proxy_response = (body, headers = {}, statusCode = 200) => {
    return {statusCode, headers, body}
}

const setup = async (swaggerFile) => {
    const swaggerDoc = await fs.readFile(swaggerFile);

    return async function (event, context, callback) {

        debug("incoming event=" + JSON.stringify(event));

        const resource = path.basename(event.path);
        debug("Request for API DOCS: " + resource);

        if (resource === 'index.html') {
            return proxy_response(
                await generateHTML(swaggerFile),
                {"content-type": "text/html"}
            );
        }

        // serve swaggerDoc yaml file
        if (resource === path.basename(swaggerFile)) {
            debug("Request for the individual swagger doc yaml. Returning string of length " + swaggerDoc.length);
            return proxy_response(
                Buffer.from(swaggerDoc).toString(),
                {"content-type": "text/yaml"}
            );
        }

        debug(`Going to read file ${resource} with absolute path ${absolutePath}`);

        try {
            const data = await fs.readFile(`${absolutePath}/${resource}`)
            debug("Read file successfully. length=" + data.length);

            return proxy_response(
                Buffer.from(data).toString(),
                {"content-type": contentType(path.extname(resource))},
                200,
            );

        } catch (e) {
            return proxy_response(
                "not found",
                {"content-type": "text/plain"},
                404,
            );
        }
    }
};

module.exports = {
    setup,
    generateHTML
}
