import express, { Application } from 'express'
import request from 'supertest'
import { FollowerServiceImpl } from '@domains/follower/service/follower.service.impl'
import { followerRouter } from '@domains/follower'
import { UserRepository } from '@domains/user/repository'
import { FollowerRepository } from '@domains/follower/repository/follower.repository'

jest.mock('@utils', () => ({
  withAuth: (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.locals.context = { userId: 'mockUserId' }
    next()
  }
}))

jest.mock('@domains/follower/service/follower.service.impl', () => {
  return {
    FollowerServiceImpl: jest.fn().mockImplementation(() => ({
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      isFollowing: jest.fn(),
      areBothFollowingEachOther: jest.fn()
    }))
  }
})

describe('FollowerController', () => {
  let app: Application
  let followerService: jest.Mocked<FollowerServiceImpl>

  beforeEach(() => {
    app = express()
    app.use(express.json())
    app.use((req, res, next) => {
      res.locals.context = {
        userId: 'mockUserId'
      }
      next()
    })

    const mockFollowerRepository: jest.Mocked<FollowerRepository> = {
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      isFollowing: jest.fn()
    }

    const mockUserRepository: jest.Mocked<UserRepository> = {
      getById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      getRecommendedUsersPaginated: jest.fn(),
      getByEmailOrUsername: jest.fn(),
      getUsersByUsername: jest.fn(),
      isPrivate: jest.fn(),
      updateProfileImage: jest.fn(),
      updatePrivacy: jest.fn()
    }

    followerService = new FollowerServiceImpl(mockFollowerRepository, mockUserRepository) as jest.Mocked<FollowerServiceImpl>

    (followerRouter as any).stack.forEach((layer: { route: any, name: string, handle: any }) => {
      if (layer.name === 'bound dispatch') {
        layer.handle.service = followerService
      }
    })

    app.use('/follower', followerRouter)
  })

  describe('POST /follower/follow/:user_id', () => {
    it('should return 201 and success when a user is followed', async () => {
      followerService.followUser.mockResolvedValue(undefined)
      const response = await request(app).post('/follower/follow/targetUserId')
      expect(response.status).toBe(201)
      expect(response.body).toEqual({
        user: 'targetUserId',
        message: 'User followed successfully'
      })
    })
  })

  describe('POST /follower/unfollow/:user_id', () => {
    it('should return 200 and success whe a user is unfollowed', async () => {
      followerService.unfollowUser.mockResolvedValue(undefined)
      const response = await request(app).post('/follower/unfollow/targetUserId')
      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        user: 'targetUserId',
        message: 'User unfollowed successfully'
      })
    })
  })
})
