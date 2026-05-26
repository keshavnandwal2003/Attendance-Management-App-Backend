const swaggerJsDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Attendance Management System API',
            version: '1.0.0',
            description: 'A comprehensive API for managing student attendance with support for authentication, class management, and attendance tracking.',
            contact: {
                name: 'API Support',
                email: 'support@example.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
            {
                url: 'https://api.example.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'JWT token for authentication',
                },
                cookieAuth: {
                    type: 'apiKey',
                    in: 'cookie',
                    name: 'token',
                    description: 'Session cookie token',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'User ID',
                        },
                        name: {
                            type: 'string',
                            description: 'User full name',
                        },
                        email: {
                            type: 'string',
                            format: 'email',
                            description: 'User email address',
                        },
                        role: {
                            type: 'string',
                            enum: ['Teacher', 'Student', 'Admin'],
                            description: 'User role',
                        },
                        // isEmailVerified: {
                        //     type: 'boolean',
                        //     description: 'Email verification status',
                        // },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                Class: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Class ID',
                        },
                        name: {
                            type: 'string',
                            description: 'Class name',
                        },
                        code: {
                            type: 'string',
                            description: 'Unique class code for joining',
                        },
                        teacher: {
                            type: 'string',
                            description: 'Teacher user ID',
                        },
                        students: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'List of student IDs',
                        },
                        createdAt: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
                AttendanceSession: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            description: 'Session ID',
                        },
                        classId: {
                            type: 'string',
                            description: 'Class ID',
                        },
                        teacherId: {
                            type: 'string',
                            description: 'Teacher ID',
                        },
                        date: {
                            type: 'string',
                            format: 'date-time',
                        },
                        status: {
                            type: 'string',
                            enum: ['active', 'closed'],
                            description: 'Session status',
                        },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: {
                            type: 'boolean',
                            example: false,
                        },
                        message: {
                            type: 'string',
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
            {
                cookieAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.js', './src/controllers/*.js'],
};

const specs = swaggerJsDoc(options);

module.exports = specs;
