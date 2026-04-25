import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Redis Cache API',
      version: '1.0.0',
      description: 'API for Redis cache management with JWT authentication',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
          },
          required: ['id', 'username'],
        },
        LoginRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username',
            },
            password: {
              type: 'string',
              description: 'Password',
            },
          },
          required: ['username', 'password'],
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'Username',
            },
            password: {
              type: 'string',
              description: 'Password',
            },
          },
          required: ['username', 'password'],
        },
        LoginResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
        HealthResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['ok'],
            },
          },
        },
      },
    },
    security: [
      {
        cookieAuth: [],
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/app.ts', './src/api/**/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
