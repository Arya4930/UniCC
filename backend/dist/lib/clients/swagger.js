"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerSpec = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
exports.swaggerSpec = (0, swagger_jsdoc_1.default)({
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
});
//# sourceMappingURL=swagger.js.map