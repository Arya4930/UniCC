import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
    definition: {
        openapi: "3.0.0",
        info: {
            title: "UniCC API Documentation",
            version: "1.0.0",
            description: "API documentation for the UniCC application.",
        },
        tags: [
            { name: "System" },
            { name: "Authentication" },
            { name: "Academics" },
            { name: "Hostel" },
            { name: "Files" },
        ],
        servers: [
            { url: "https://api.uni-cc.site" },
            { url: "http://localhost:3000" },
        ],
        // components: {
        //     securitySchemes: {
        //         CookieAuth: {
        //             type: "apiKey",
        //             in: "header",
        //             name: "Cookie"
        //         },
        //         CsrfToken: {
        //             type: "apiKey",
        //             in: "header",
        //             name: "X-CSRF-Token"
        //         },
        //         AuthorizedID: {
        //             type: "apiKey",
        //             in: "header",
        //             name: "X-Authorized-ID"
        //         }
        //     }
        // },
        // security: [
        //     { CookieAuth: [] },
        //     { CsrfToken: [] },
        //     { AuthorizedID: [] }
        // ]
    },
    apis: ["./backend/src/routes/**/*.ts"],
})