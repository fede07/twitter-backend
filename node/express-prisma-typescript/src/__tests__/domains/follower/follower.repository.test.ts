import { FollowerRepositoryImpl } from '@domains/follower/repository/follower.repository.impl'
import { PrismaClient } from '@prisma/client'

jest.mock('@prisma/client')

describe('FollowerRepositoryImpl', () => {
  let followerRepository: FollowerRepositoryImpl
  let dbMock: jest.Mocked<PrismaClient>

  beforeEach(() => {
    dbMock = {
      follow: {
        create: jest.fn(),
        findFirst: jest.fn(),
        delete: jest.fn()
      }
    } as unknown as jest.Mocked<PrismaClient>

    followerRepository = new FollowerRepositoryImpl(dbMock)
  })

  describe('followUser', () => {
    it('should allow a user to follow another user', async () => {
      await followerRepository.followUser('targetUserId', 'mockUserId')
      expect(dbMock.follow.create).toHaveBeenCalledWith({
        data: {
          followedId: 'targetUserId',
          followerId: 'mockUserId'
        }
      })
    })
  })

  describe('unfollowUser', () => {
    it('should allow a user to unfollow another user', async () => {
      (dbMock.follow.findFirst as jest.Mock).mockResolvedValue({
        id: 'mockFollowId'
      })
      await followerRepository.unfollowUser('targetUserId', 'mockedUserId')
      expect(dbMock.follow.delete).toHaveBeenCalled()
    })
  })

  it('should not call PrismaClient to delete if no follow entry exists', async () => {
    (dbMock.follow.findFirst as jest.Mock).mockResolvedValue(null)
    await followerRepository.unfollowUser('followedId', 'followerId')

    expect(dbMock.follow.delete).not.toHaveBeenCalled()
  })

  describe('isFollowing', () => {
    it('should return true if a follow entry exist', async () => {
      const followedId = 'mockFollowedId'
      const followerId = 'mockFollowerId'

      const result = await followerRepository.isFollowing(followedId, followerId)
      expect(result).toBe(true)
    })

    it('should return false if a follow entry does not exist', async () => {
      (dbMock.follow.findFirst as jest.Mock).mockResolvedValue(null)
      const result = await followerRepository.isFollowing('mockFollowedId', 'mockFollowerId')
      expect(result).toBe(false)
    })
  })
})
