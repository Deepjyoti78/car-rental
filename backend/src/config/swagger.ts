import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Drivio API — Modern Multi-Vendor Car Rental Marketplace',
      version: '1.0.0',
      description:
        'RESTful API documentation for Drivio car rental platform supporting Customers, Vendors, and Administrators.',
      contact: {
        name: 'Drivio Engineering Team',
        email: 'support@drivio.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/**/*.routes.ts', './src/app.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
