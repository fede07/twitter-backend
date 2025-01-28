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
      },
      {
        url: 'https://twitter-backend-production-4491.up.railway.app',
        description: 'Production server'
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
      },
      {
        name: 'Health',
        description: 'Health endpoints'
      },
      {
        name: 'Post',
        description: 'Post endpoints'
      },
      {
        name: 'Reaction',
        description: 'Reaction endpoints'
      },
      {
        name: 'User',
        description: 'User endpoints'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          in: 'header'
        }
      },
      schemas: {
        SignupInputDTO: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            password: { type: 'string', format: 'password' }
          },
          example: {
            email: 'user@example.com',
            username: 'user123',
            password: 'StrongPass123!'
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
    security: [
      {
        bearerAuth: []
      }
    ],
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
              description: 'Validation error. Missing password or invalid password.',
              content: {
                'application/json': {
                  example: {
                    missingPassword: {
                      message: 'Validation error',
                      code: 400,
                      errors: [
                        {
                          property: 'password',
                          children: [],
                          constraints: {
                            isNotEmpty: 'password should not be empty',
                            isString: 'password must be a string'
                          }
                        }
                      ]
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized. Incorrect credentials.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'INCORRECT_CREDENTIALS'
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
      '/api/follower/follow/{user_id}': {
        post: {
          summary: 'Follow a user',
          description: 'Allows the authenticated user to follow another user.',
          tags: ['Follow'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'user_id',
              in: 'path',
              required: true,
              description: 'The ID of the user to be followed.',
              schema: {
                type: 'string',
                format: 'uuid',
                example: '06ea1868-7286-42c2-a7c3-bfa7d051495f'
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
                      message: {
                        type: 'string'
                      }
                    }
                  },
                  example: {
                    user: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    message: 'User followed successfully.'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized. Not logged in.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
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
            409: {
              description: 'Conflict',
              content: {
                'application/json': {
                  examples: {
                    alreadyFollowing: {
                      summary: 'User is already following the target user',
                      value: {
                        message: 'Conflict',
                        code: 409,
                        errors: {
                          error_code: 'ALREADY_FOLLOWING'
                        }
                      }
                    },
                    selfFollowing: {
                      summary: 'User cannot follow themselves',
                      value: {
                        message: 'Conflict',
                        code: 409,
                        errors: {
                          error_code: 'CANNOT_FOLLOW_YOURSELF'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/follower/unfollow/{user_id}': {
        post: {
          summary: 'Unfollow a user',
          description: 'Allows the authenticated user to unfollow another user.',
          tags: ['Follow'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'user_id',
              in: 'path',
              required: true,
              description: 'The ID of the user to be unfollowed.',
              schema: {
                type: 'string',
                format: 'uuid',
                example: '06ea1868-7286-42c2-a7c3-bfa7d051495f'

              }
            }
          ],
          responses: {
            204: {
              description: 'User unfollowed successfully.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string'
                      }
                    },
                    example: {
                      user: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      message: 'User unfollowed successfully.'
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized. Not logged in.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            },
            // 403: {
            //   description: 'Forbidden. User cannot unfollow themself.',
            //   content: {
            //     'application/json': {
            //       example: {
            //         message: 'Forbidden. You are not allowed to perform this action.',
            //         code: 403
            //       }
            //     }
            //   }
            // },
            409: {
              description: 'Not Following',
              content: {
                'application/json': {
                  examples: {
                    alreadyUnfollow: {
                      summary: 'User is already not following the target user',
                      value: {
                        message: 'Conflict',
                        code: 409,
                        errors: {
                          error_code: 'NOT_FOLLOWING'
                        }
                      }
                    },
                    selfUnfollowing: {
                      summary: 'User cannot unfollow themselves',
                      value: {
                        message: 'Conflict',
                        code: 409,
                        errors: {
                          error_code: 'CANNOT_UNFOLLOW_YOURSELF'
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // HEALTH
      '/api/health': {
        get: {
          summary: 'Health check',
          description: 'Checks if the server is running.',
          tags: ['Health'],
          responses: {
            200: {
              description: 'Server is running.'
            },
            500: {
              description: 'Server is not running.'
            }
          }
        }
      },
      // POST
      '/api/post/': {
        get: {
          summary: 'Get all posts from public feed and followed users.',
          description: 'Get all posts.',
          tags: ['Post'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            200: {
              description: 'Get all posts successfully.',
              content: {
                'application/json': {
                  schema: {},
                  example: [
                    {
                      id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'Hello World!',
                      images: [],
                      createdAt: '2021-03-22T15:25:43.000Z',
                      parentId: null
                    },
                    {
                      id: '1e0238cb-ff48-4128-9406-a52d83a06679',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'This is a test post!',
                      images: [],
                      createdAt: '2021-03-22T15:27:34.000Z',
                      parentId: null
                    }
                  ]
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          summary: 'Create a new post',
          description: 'Create a new post.',
          tags: ['Post'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreatePostInputDTO'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Post created successfully.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PostDTO'
                  },
                  example: {
                    id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    content: 'Hello World!',
                    images: [],
                    createdAt: '2021-03-22T15:25:43.000Z',
                    parentId: null
                  }
                }
              }
            },
            400: {
              description: 'Validation Error',
              content: {
                'application/json': {
                  example: {
                    validationError: {
                      summary: 'Validation Error',
                      value: {
                        message: 'Validation error',
                        code: 400,
                        errors: {
                          property: 'content',
                          children: [],
                          constraints: {
                            maxLength: 'content must be shorter than or equal to 240 characters',
                            isNotEmpty: 'content should not be empty',
                            isString: 'content must be a string'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/post/{post_id}': {
        get: {
          summary: 'Get a post',
          description: 'Get a post.',
          tags: ['Post'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'post_id',
              in: 'path',
              required: true,
              description: 'The ID of the post to be retrieved.',
              schema: {
                type: 'string'
              },
              example: '52d442da-a706-40cd-90a5-c2595e426ee5'
            }
          ],
          responses: {
            200: {
              description: 'Get a post successfully.',
              content: {
                'application/json': {
                  example: {
                    id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    content: 'Hello World!',
                    images: [],
                    createdAt: '2021-03-22T15:25:43.000Z',
                    parentId: null
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            },
            404: {
              description: 'Post not found.',
              content: {
                'application/json': {
                  example: {
                    message: 'Not found'
                  }
                }
              }
            },
            500: {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  example: {
                    message: 'Internal Server Error',
                    code: 500,
                    errors: {
                      error_code: 'INTERNAL_SERVER_ERROR'
                    }
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete a post',
          description: 'Delete a post.',
          tags: ['Post'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              name: 'post_id',
              in: 'path',
              required: true,
              description: 'The ID of the post to be deleted.',
              schema: {
                type: 'string'
              },
              example: 'e8bde95c-0f72-412c-ab7e-af364acfda2c'
            }
          ],
          responses: {
            200: {
              description: 'Post deleted successfully.',
              content: {
                'application/json': {
                  example: 'Deleted post c7d2efaf-ec6a-4214-a7fb-a6c4fdba5901'
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            },
            404: {
              description: 'Post not found.',
              content: {
                'application/json': {
                  example: {
                    message: 'Not found'
                  }
                }
              }
            },
            500: {
              description: 'Internal Server Error',
              content: {
                'application/json': {
                  example: {
                    message: 'Internal Server Error',
                    code: 500,
                    errors: {
                      error_code: 'INTERNAL_SERVER_ERROR'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/post/by_user/{userId}': {
        get: {
          summary: 'Get posts by user',
          tags: ['Post'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'userId',
              required: true,
              schema: {},
              example: '5beaa857-6083-440f-880d-6338fc10e608'
            }
          ],
          responses: {
            200: {
              description: 'List of posts by user',
              content: {
                'application/json': {
                  example: [
                    {
                      id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'Hello World!',
                      images: [],
                      createdAt: '2021-03-22T15:25:43.000Z',
                      parentId: null
                    },
                    {
                      id: '1e0238cb-ff48-4128-9406-a52d83a06679',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'This is a test post!',
                      images: [],
                      createdAt: '2021-03-22T15:27:34.000Z',
                      parentId: null
                    }
                  ]
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
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
                    message: 'Not found'
                  }
                }
              }
            }
          }
        }
      },
      '/api/post/comment/{post_id}': {
        post: {
          summary: 'Create a comment on a post',
          description: 'Create a comment on a post',
          tags: ['Post'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'post_id',
              required: true,
              schema: {},
              example: '143c4f2f-69f9-4caa-b18e-8dc7dc56f5e5'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/CreatePostInputDTO'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Comment created successfully.',
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/PostDTO'
                  },
                  example: {
                    id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    content: 'Hello World!',
                    images: [],
                    createdAt: '2021-03-22T15:25:43.000Z',
                    parentId: '143c4f2f-69f9-4caa-b18e-8dc7dc56f5e5'
                  }
                }
              }
            },
            400: {
              description: 'Validation Error',
              content: {
                'application/json': {
                  example: {
                    validationError: {
                      summary: 'Validation Error',
                      value: {
                        message: 'Validation error',
                        code: 400,
                        errors: {
                          property: 'content',
                          children: [],
                          constraints: {
                            maxLength: 'content must be shorter than or equal to 240 characters',
                            isNotEmpty: 'content should not be empty',
                            isString: 'content must be a string'
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            },
            404: {
              description: 'Post not found.',
              content: {
                'application/json': {
                  example: {
                    message: 'Not found. Couldn\'t find post'
                  }
                }
              }
            }
          }
        }
      },
      '/api/post/comments/by_user/{userId}': {
        get: {
          summary: 'Get comments by user',
          tags: ['Post'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'userId',
              required: true,
              schema: {},
              example: '5beaa857-6083-440f-880d-6338fc10e608'
            }
          ],
          responses: {
            200: {
              description: 'List of comments by user',
              content: {
                'application/json': {
                  example: [
                    {
                      id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'Hello World!',
                      images: [],
                      createdAt: '2021-03-22T15:25:43.000Z',
                      parentId: '143c4f2f-69f9-4caa-b18e-8dc7dc56f5e5'
                    },
                    {
                      id: '1e0238cb-ff48-4128-9406-a52d83a06679',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'This is a test post!',
                      images: [],
                      createdAt: '2021-03-22T15:27:34.000Z',
                      parentId: '143c4f2f-69f9-4caa-b18e-8dc7dc56f5e5'
                    }
                  ]
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
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
                    message: 'Not found'
                  }
                }
              }
            }
          }
        }
      },
      // REACTION
      '/api/reaction/likes/{userId}': {
        get: {
          summary: 'Get likes by user',
          tags: ['Reaction'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'userId',
              required: true,
              schema: {},
              example: '5beaa857-6083-440f-880d-6338fc10e608'
            }
          ],
          responses: {
            200: {
              description: 'List of likes by user',
              content: {
                'application/json': {
                  example: [
                    {
                      id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'Hello World!',
                      images: [],
                      createdAt: '2021-03-22T15:25:43.000Z',
                      parentId: null,
                      author: {
                        id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                        name: 'Johnny Doe',
                        username: 'johndoe',
                        image: 'user.png'
                      },
                      qtyComments: 23,
                      qtyLikes: 19,
                      qtyRetweets: 4
                    },
                    {
                      id: '1e0238cb-ff48-4128-9406-a52d83a06679',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'This is a test post!',
                      images: [],
                      createdAt: '2021-03-22T15:27:34.000Z',
                      parentId: null,
                      author: {
                        id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                        name: 'Johnny Doe',
                        username: 'johndoe',
                        image: 'user.png'
                      },
                      qtyComments: 23,
                      qtyLikes: 19,
                      qtyRetweets: 4
                    }
                  ]
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
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
                    message: 'Not found. Couldn\'t find user'
                  }
                }
              }
            }
          }
        }
      },
      '/api/reaction/retweets/{userId}': {
        get: {
          summary: 'Get retweets by user',
          tags: ['Reaction'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'userId',
              required: true,
              schema: {},
              example: '5beaa857-6083-440f-880d-6338fc10e608'
            }
          ],
          responses: {
            200: {
              description: 'List of retweets by user',
              content: {
                'application/json': {
                  example: [
                    {
                      id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'Hello World!',
                      images: [],
                      createdAt: '2021-03-22T15:25:43.000Z',
                      parentId: null,
                      author: {
                        id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                        name: 'Johnny Doe',
                        username: 'johndoe',
                        image: 'user.png'
                      },
                      qtyComments: 23,
                      qtyLikes: 19,
                      qtyRetweets: 4
                    },
                    {
                      id: '1e0238cb-ff48-4128-9406-a52d83a06679',
                      authorId: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      content: 'This is a test post!',
                      images: [],
                      createdAt: '2021-03-22T15:27:34.000Z',
                      parentId: null,
                      author: {
                        id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                        name: 'Johnny Doe',
                        username: 'johndoe',
                        image: 'user.png'
                      },
                      qtyComments: 23,
                      qtyLikes: 19,
                      qtyRetweets: 4
                    }
                  ]
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
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
                    message: 'Not found. Couldn\'t find user'
                  }
                }
              }
            }
          }
        }
      },
      '/api/reaction/{post_id}': {
        post: {
          summary: 'Create a reaction on a post',
          description: 'Create a reaction on a post. It can be either a like or retweet.',
          tags: ['Reaction'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'post_id',
              required: true,
              schema: {},
              example: '143c4f2f-69f9-4caa-b18e-8dc7dc56f5e5'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {},
                example: {
                  type: 'LIKE'
                }
              }
            }
          },
          responses: {
            201: {
              description: 'Reaction created successfully.',
              content: {
                'application/json': {
                  schema: {},
                  example: {
                    post_id: '06ea1868-7286-42c2-a7c3-bfa7d051495f'
                  }
                }
              }
            },
            400: {
              description: 'Validation Error',
              content: {
                'application/json': {
                  example: {
                    validationError: {
                      summary: 'Validation Error',
                      value: 'Invalid reaction type'
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            },
            404: {
              description: 'Post not found.',
              content: {
                'application/json': {
                  example: {
                    message: 'Not found. Couldn\'t find post'
                  }
                }
              }
            },
            409: {
              description: 'Reaction already exists.',
              content: {
                'application/json': {
                  examples: [
                    {
                      summary: 'Like already exists',
                      value: {
                        message: 'CONFLICT',
                        code: 409,
                        errors: {
                          error_code: 'ALREADY_RETWEETED'
                        }
                      }
                    },
                    {
                      summary: 'Like already exists',
                      value: {
                        message: 'CONFLICT',
                        code: 409,
                        errors: {
                          error_code: 'ALREADY_LIKED'
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete a reaction on a post',
          description: 'Delete a reaction on a post',
          tags: ['Reaction'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'post_id',
              required: true,
              schema: {},
              example: '143c4f2f-69f9-4caa-b18e-8dc7dc56f5e5'
            }
          ],
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {},
                example: {
                  type: 'LIKE'
                }
              }
            }
          },
          responses: {
            204: {
              description: 'Reaction deleted successfully.'
            },
            400: {
              description: 'Validation Error',
              content: {
                'application/json': {
                  example: {
                    validationError: {
                      summary: 'Validation Error',
                      value: 'Invalid reaction type'
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            },
            404: {
              description: 'Post not found.',
              content: {
                'application/json': {
                  example: {
                    message: 'Not found. Couldn\'t find post'
                  }
                }
              }
            },
            409: {
              description: 'Reaction does not exists.',
              content: {
                'application/json': {
                  examples: [
                    {
                      summary: 'Retweet does not exists',
                      value: {
                        message: 'Conflict',
                        code: 409,
                        errors: {
                          error_code: 'NOT_RETWEETED'
                        }
                      }
                    },
                    {
                      summary: 'Like does not exists',
                      value: {
                        message: 'Conflict',
                        code: 409,
                        errors: {
                          error_code: 'NOT_LIKED'
                        }
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      },
      // USER
      '/api/user/': {
        get: {
          summary: 'Get recommended users',
          tags: ['User'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'query',
              name: 'limit',
              required: false,
              schema: {
                type: 'integer'
              },
              example: 10
            },
            {
              in: 'query',
              name: 'skip',
              required: false,
              schema: {
                type: 'integer'
              },
              example: 0
            }
          ],
          responses: {
            200: {
              description: 'List of recommended users. Recommended users users followed by the user\'s followings',
              content: {
                'application/json': {
                  example: [
                    {
                      id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                      username: 'johndoe',
                      email: 'johndoe@example.com',
                      firstName: 'John',
                      lastName: 'Doe',
                      bio: 'I am a developer',
                      profilePicture: 'https://i.pravatar.cc/150?img=7',
                      createdAt: '2021-03-22T15:25:43.000Z',
                      updatedAt: '2021-03-22T15:25:43.000Z'
                    }
                  ]
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
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
                    message: 'Not found. Couldn\'t find user'
                  }
                }
              }
            }
          }
        },
        delete: {
          summary: 'Delete user',
          description: 'WARNING: This endpoint **permanently deletes** the logged-in user from the database. \n' +
            '      Please use it with caution, as this action is irreversible.',
          tags: ['User'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            204: {
              description: 'User deleted successfully.',
              content: {
                'application/json': {
                  example: 'Deleted user'
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
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
                    message: 'Not found. Couldn\'t find user'
                  }
                }
              }
            }
          }
        }
      },
      '/api/user/me': {
        get: {
          summary: 'Get current user',
          tags: ['User'],
          security: [
            {
              bearerAuth: []
            }
          ],
          responses: {
            200: {
              description: 'Current user',
              content: {
                'application/json': {
                  example: {
                    id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    name: 'Johnny Doe',
                    username: 'johndoe',
                    profileImage: 'user.png'
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/user/:userId': {
        get: {
          summary: 'Get user by id',
          tags: ['User'],
          security: [
            {
              bearerAuth: []
            }
          ],
          parameters: [
            {
              in: 'path',
              name: 'userId',
              required: true,
              schema: {},
              example: '5beaa857-6083-440f-880d-6338fc10e608'
            }
          ],
          responses: {
            200: {
              description: 'User by id',
              content: {
                'application/json': {
                  example: {
                    id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    name: 'Johnny Doe',
                    username: 'johndoe',
                    profileImage: 'user.png'
                  }
                }
              }
            },
            400: {
              description: 'Validation Error',
              content: {
                'application/json': {
                  example: {
                    message: 'Validation Error',
                    code: 400,
                    errors: {
                      error_code: 'INVALID_UUID'
                    }
                  }
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {
                      error_code: 'MISSING_TOKEN'
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
                    message: 'Not found. Couldn\'t find user'
                  }
                }
              }
            }
          }
        }
      },
      '/api/user/privacy': {
        post: {
          summary: 'Change privacy settings',
          tags: ['User'],
          security: [
            {
              bearerAuth: []
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {},
                example: {
                  privacy: true
                }
              }
            }
          },
          responses: {
            200: {
              description: 'Privacy settings changed successfully.',
              content: {
                'application/json': {
                  example: {
                    id: '06ea1868-7286-42c2-a7c3-bfa7d051495f',
                    name: 'Johnny Doe',
                    username: 'johndoe',
                    profileImage: 'user.png',
                    isPrivate: true
                  }
                }
              }
            },
            400: {
              description: 'Validation Error',
              content: {
                'application/json': {
                  example: 'INVALID_PRIVACY_SETTING'
                }
              }
            },
            401: {
              description: 'Unauthorized.',
              content: {
                'application/json': {
                  example: {
                    message: 'Unauthorized. You must login to access this content.',
                    code: 401,
                    errors: {}
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/domains/**/*.ts']
}

const swaggerOptions = {
  explorer: false
}

export { options, swaggerOptions }
