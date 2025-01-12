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
        url: 'http://localhost:8080',
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Authentication endpoints'
      },
      {
        name: 'Follow',
        description: 'Follow endpoints'
      }
    ],
    components: {
      schemas: {
        SignupInputDTO: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            password: { type: 'string', format: 'password' }
          },
          required: ['email', 'username', 'password']
        },
        LoginInputDTO: {
          oneOf: [
            {
              type: 'object',
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string', format: 'password' }
              },
              required: ['email', 'password']
            },
            {
              type: 'object',
              properties: {
                username: { type: 'string' },
                password: { type: 'string', format: 'password' }
              },
              required: ['username', 'password']
            }
          ]
        },
        TokenDTO: {
          type: 'object',
          properties: {
            token: { type: 'string' }
          }
        },
        CreatePostInputDTO: {
          type: 'object',
          properties: {
            content: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } }
          },
          required: ['content']
        },
        PostDTO: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            authorId: { type: 'string' },
            content: { type: 'string' },
            images: { type: 'array', items: { type: 'string' } },
            createdAt: { type: 'string', format: 'date-time' },
            parentId: { type: 'string' }
          },
          required: ['id', 'authorId', 'content', 'createdAt']
        }
      }
    },
    paths: {
      // AUTH
      '/api/auth/signup': {
        post: {
          summary: 'Register a new user',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SignupInputDTO'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'User created successfully',
              content: {
                'application/json': {
                  example: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQ...'
                  }
                }
              }
            },
            400: {
              description: 'Bad request',
              content: {
                'application/json': {
                  examples: {
                    missingEmail: {
                      summary: 'Missing email or invalid email',
                      value: {
                        message: 'Validation error',
                        code: 400,
                        errors: {
                          property: 'email',
                          children: [],
                          constraints: {
                            isEmail: 'email must be an email',
                            isNotEmpty: 'email should not be empty',
                            isString: 'email must be a string'
                          }
                        }
                      }
                    },
                    passwordTooWeak: {
                      summary: 'Password is too weak',
                      value: {
                        message: 'Validation error',
                        code: 400,
                        errors: {
                          property: 'password',
                          children: [],
                          constraints: {
                            isStrongPassword: 'password is not strong enough'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            409: {
              description: 'Conflict',
              content: {
                'application/json': {
                  example: {
                    message: 'Conflict',
                    code: 409,
                    errors: {
                      error_code: 'USER_ALREADY_EXIST'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Login an existing user',
          description: 'Authenticates a user and returns a token.',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginInputDTO'
                },
                example: {
                  email: 'user@example.com',
                  password: 'StrongPass123!'
                }
              }
            }
          },
          responses: {
            200: {
              description: 'User successfully logged in.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/TokenDTO'
                  },
                  example: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp9.ey...'
                  }
                }
              }
            },
            400: {
              description: 'Validation error.',
              content: {
                'application/json': {
                  example: {
                    missingPassword: {
                      message: 'Validation error',
                      code: 400,
                      errors: {
                        property: 'password',
                        children: [],
                        constraints: {}
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized. Incorrect password.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'INCORRECT_PASSWORD'
                    }
                  }
                }
              }
            },
            404: {
              description: 'User not found.',
              content: {
                'application/json': {
                  example: {
                    message: 'Not found. Couldn\'t find user',
                    code: 404
                  }
                }
              }
            },
            500: {
              description: 'Internal Server Error.',
              content: {
                'application/json': {
                  example: {
                    message: 'Internal Server Error',
                    code: 500
                  }
                }
              }

            }
          }
        }
      },
      // FOLLOW
      '/api/follow/{user_id}': {
        post: {
          summary: 'Follow a user',
          description: 'Allows the authenticated user to follow another user.',
          tags: ['Follow'],
          parameters: [
            {
              name: 'user_id',
              in: 'path',
              required: true,
              description: 'The ID of the user to be followed.',
              schema: {
                type: 'string'
              }
            }
          ],
          responses: {
            201: {
              description: 'User followed successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      followedUserId: {
                        type: 'string',
                        description: 'The ID of the user that was followed.'
                      }
                    }
                  },
                  example: {
                    followedUserId: '12345'
                  }
                }
              }
            },
            400: {
              description: 'Validation error.'
            },
            401: {
              description: 'Unauthorized. Invalid token or session expired.'
            }
          }
        }
      }
    }
  },
  apis: ['./src/domains/**/*.ts']
}

const swaggerOptions = {
  explorer: true
}

export { options, swaggerOptions }
