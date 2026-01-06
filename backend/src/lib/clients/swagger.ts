import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "UniCC API Documentation",
            version: "1.0.0",
            description: "API documentation for the UniCC application.",
        },
        servers: [
            { url: "https://api.uni-cc.site" },
            { url: "http://localhost:3000" },
        ]
    },
    apis: ["./backend/src/routes/**/*.ts"]
})