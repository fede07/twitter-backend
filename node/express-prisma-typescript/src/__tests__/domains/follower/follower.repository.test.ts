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
        findFirst: jest.fn() as jest.Mock,
        delete: jest.fn(),
      },
    } as unknown as jest.Mocked<PrismaClient>

    followerRepository = new FollowerRepositoryImpl(dbMock)
  })

  describe('followUser', () => {
    it('should allow a user to follow another user', async () => {
      await followerRepository.followUser('targetUserId', 'mockUserId')
      expect(dbMock.follow.create).toHaveBeenCalledWith({
        data: {
          followedId: 'targetUserId',
          followerId: 'mockUserId',
        },
      })
    })
  })

  describe('unfollowUser', () => {
    it('should allow a user to unfollow another user', async () => {
      (dbMock.follow.findFirst as jest.Mock).mockResolvedValue({
        id: 'mockFollowId',
      })
      await followerRepository.unfollowUser('targetUserId', 'mockedUserId')
      expect(dbMock.follow.findFirst).toHaveBeenCalledWith({
        where: {
          followedId: 'targetUserId',
          followerId: 'mockedUserId',
        },
        select: { id: true },
      })
      expect(dbMock.follow.delete).toHaveBeenCalledWith({
        where: {
          id: 'mockFollowId',
        },
      })
    })
  })

  it('should not call PrismaClient to delete if no follow entry exists', async () => {
    (dbMock.follow.findFirst as jest.Mock).mockResolvedValue(null)
    await followerRepository.unfollowUser('followedId', 'followerId')

    expect(dbMock.follow.findFirst).toHaveBeenCalledWith({
      where: {
        followedId: 'followedId',
        followerId: 'followerId',
      },
      select: { id: true },
    })

    expect(dbMock.follow.delete).not.toHaveBeenCalled()
  })

  describe('isFollowing', () => {
    it('should return true if a follow entry exist', async () => {
      const followedId = 'mockFollowedId'
      const followerId = 'mockFollowerId'

      ;(dbMock.follow.findFirst as jest.Mock).mockResolvedValue({
        id: 'mockFollowId',
      })

      const result = await followerRepository.isFollowing(followedId, followerId)

      expect(dbMock.follow.findFirst).toHaveBeenCalledWith({
        where: {
          followedId,
          followerId,
        },
        select: { id: true },
      })
      expect(result).toBe(true)
    })

    it('should return false if a follow entry does not exist', async () => {

      (dbMock.follow.findFirst as jest.Mock).mockResolvedValue(null)
      const result = await followerRepository.isFollowing('mockFollowedId', 'mockFollowerId')

      expect(dbMock.follow.findFirst).toHaveBeenCalledWith({
        where: {
          followedId: 'mockFollowedId',
          followerId: 'mockFollowerId',
        },
        select: { id: true },
      })
      expect(result).toBe(false)
    })
  })
})
