const swaggerJsDoc = require("swagger-jsdoc");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Attendance Management System API",
            version: "1.0.0",
            description:
                "A comprehensive API for authentication, class management, and attendance tracking.",
            contact: {
                name: "API Support",
                email: "support@example.com",
            },
        },

        servers: [
            {
                url: process.env.VERCEL_URL
                    ? `https://${process.env.VERCEL_URL}`
                    : "http://localhost:5000",
                description: "Server URL",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "token",
                },
            },

            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        role: {
                            type: "string",
                            enum: ["Teacher", "Student", "Admin"],
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                Class: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        name: { type: "string" },
                        code: { type: "string" },
                        teacher: { type: "string" },
                        students: {
                            type: "array",
                            items: { type: "string" },
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                        },
                    },
                },

                AttendanceSession: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        classId: { type: "string" },
                        teacherId: { type: "string" },
                        date: { type: "string", format: "date-time" },
                        status: {
                            type: "string",
                            enum: ["active", "closed"],
                        },
                    },
                },

                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string" },
                    },
                },
            },
        },

        security: [
            { bearerAuth: [] },
            { cookieAuth: [] },
        ],
    },

    apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

module.exports = swaggerJsDoc(options);