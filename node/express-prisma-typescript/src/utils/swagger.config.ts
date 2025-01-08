import { OAS3Options } from 'swagger-jsdoc'

const options: OAS3Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation using Swagger for Twitter Backend Project'
    },
    servers: [
      {
        url: 'http://localhost:8080'
      }
    ]
  },
  apis: ['./src/domains/**/*.ts']
}

const swaggerOptions = {
  explorer: true
}

export { options, swaggerOptions }
