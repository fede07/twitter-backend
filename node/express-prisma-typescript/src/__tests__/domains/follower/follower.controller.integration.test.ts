import request from 'supertest'
import { Express } from 'express'
import express from 'express'
import HttpStatus from 'http-status'
import { withAuth } from '@utils'
import { followerRouter } from '@domains/follower'

// Mock the implementation of `withAuth`
jest.mock('@utils', () => ({
  ...jest.requireActual('@utils'),
  Constants: {
    LOG_LEVEL: 'info',
  },
  withAuth: jest.fn() // Mock only the `withAuth` middleware
}))

jest.mock('@domains/follower/service/follower.service.impl', () => {
  return {
    FollowerServiceImpl: jest.fn().mockImplementation(() => ({
      followUser: jest.fn().mockResolvedValue(undefined), // Mock followUser behavior
      unfollowUser: jest.fn().mockResolvedValue(undefined),
    })),
  }
})

const mockWithAuth = withAuth as jest.Mock // Explicitly cast `withAuth` as a Jest mock

// Prueba del controlador de seguidores
describe('Follower Controller', () => {
  let app: Express

  // Set up the application and router before each test
  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use('/follower', followerRouter)
  })

  // Reset mocks after each test
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return 201 when a user is followed successfully', async () => {
    // Mock `withAuth` to simulate a valid token
    mockWithAuth.mockImplementation((req, res, next) => {
      res.locals.context = { userId: 'mockUserId' } // Simulate valid token
      next() // Proceed to the next middleware
    })

    // Simulate service success
    jest.mock('@domains/follower/service/follower.service.impl', () => ({
      followUser: jest.fn().mockResolvedValueOnce({}),
    }))

    const response = await request(app)
      .post('/follower/follow/targetUserId')
      .send()

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      user: 'targetUserId',
      message: 'User followed successfully'
    })
  })

  it('should return 401 if the token is missing', async () => {
    // Mock `withAuth` for missing token
    mockWithAuth.mockImplementation((req, res) => {
      res.status(HttpStatus.UNAUTHORIZED).json({ error: 'Unauthorized' }) // Simulate rejection
    })

    const response = await request(app)
      .post('/follower/follow/targetUserId')
      .send()

    expect(response.status).toBe(401)
    expect(response.body).toEqual({
      error: 'Unauthorized'
    })
  })

  it('should return 500 if there is an error', async () => {
    // Mock `withAuth` to simulate a valid token
    mockWithAuth.mockImplementation((req, res, next) => {
      res.locals.context = { userId: 'mockUserId' }
      next()
    })

    jest.mock('@domains/follower/service/follower.service.impl', () => ({
      followUser: jest.fn().mockRejectedValueOnce(new Error('Something went wrong')),
    }))

    const response = await request(app)
      .post('/follower/follow/targetUserId')
      .send()

    expect(response.status).toBe(500)
    expect(response.body).toEqual({ error: 'Something went wrong' })
  })
})
