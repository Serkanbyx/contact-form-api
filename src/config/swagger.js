const swaggerJsdoc = require("swagger-jsdoc");
const { version, description } = require("../../package.json");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Contact Form API",
      version,
      description,
      contact: {
        name: "Serkanby",
        url: "https://serkanbayraktar.com/",
      },
    },
    servers: [
      {
        url: "/",
        description: "Current server",
      },
    ],
    tags: [
      { name: "Health", description: "Server health check" },
      { name: "Contacts", description: "Contact form submission operations" },
    ],
  },
  apis: ["./src/routes/*.js", "./src/server.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
