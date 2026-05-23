import swaggerJSDoc from 'swagger-jsdoc';

/**
 * Generates OpenAPI JSON specs dynamically by scanning the JSDoc comments in route.ts files.
 */
export const getApiDocs = async () => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Task Management API',
        version: '1.0.0',
        description: 'Interactive API Documentation for the Task Management System',
      },
      servers: [
        {
          url: 'http://localhost:5000',
          description: 'Local development server',
        },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    // Scan all API route files for documentation comments
    apis: ['./src/app/api/**/*.ts'],
  };

  const spec = swaggerJSDoc(options);
  return spec;
};
