import { Express } from 'express'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import swaggerConfig from './swagger.config'

const setupSwagger = (app: Express): void => {
  try {
    // Generate Swagger Specification
    const swaggerSpec = swaggerJsdoc(swaggerConfig)

    // Restrict access to Swagger docs in production
    if (process.env.NODE_ENV !== 'production') {
      app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
      console.log('Swagger docs available at /api-docs')
    } else {
      console.log('Swagger is disabled in production.')
    }
  } catch (error) {
    console.error('Failed to setup Swagger:', error)
  }
}

export default setupSwagger
