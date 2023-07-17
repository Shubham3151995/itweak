const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require("../swagger.json");

//swagger function to create swagger ui
  const swaggerDocs=(app, port)=> {
    // Swagger page
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerJsdoc));
  
    // Docs in JSON format
    // docs path in the api
    app.get("/docs.json", (req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.send(swaggerJsdoc);
    });
  //printing the docs path in console
   console.log(`Docs available at http://localhost:${port}/docs`);
  }
  module.exports=swaggerDocs;