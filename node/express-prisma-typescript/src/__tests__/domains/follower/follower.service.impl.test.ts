import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { FollowerServiceImpl } from '@domains/follower/service/follower.service.impl'
import { ConflictException, ForbiddenException } from '@utils'

describe( 'FollowerServiceImpl', () => {
  let followerService: FollowerServiceImpl
  let followerRepository: jest.Mocked<FollowerRepository>

  beforeEach(() => {
    followerRepository = {
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      isFollowing: jest.fn(),
    } as unknown as jest.Mocked<FollowerRepository>
    followerService = new FollowerServiceImpl(followerRepository)
  })

  describe( 'followUser', () => {
    it('should allow a user to follow another user', async () => {
      followerRepository.isFollowing.mockResolvedValue(false)
      await followerService.followUser('targetUserId', 'mockUserId')

      expect(followerRepository.followUser).toHaveBeenCalledWith('targetUserId', 'mockUserId')
    })

    it('should not allow a user to follow themselves', async () => {
      await expect(followerService.followUser('mockUserId', 'mockUserId')).rejects.toThrow(ForbiddenException)
    })

    it('should throw a ConflictException if the user is already following the target user', async () => {
      followerRepository.isFollowing.mockResolvedValue(true)
      await expect(followerService.followUser('targetUserId', 'mockUserId')).rejects.toThrow(ConflictException)
    })
  })

  describe( 'unfollowUser', () => {
    it('should allow a user to unfollow another user', async () => {
      followerRepository.isFollowing.mockResolvedValue(true)
      await followerService.unfollowUser('targetUserId', 'mockUserId')

      expect(followerRepository.unfollowUser).toHaveBeenCalledWith('targetUserId', 'mockUserId')
    })

    it('should not allow a user to unfollow themselves', async () => {
      await expect(followerService.unfollowUser('mockUserId', 'mockUserId')).rejects.toThrow(ForbiddenException)
    })

    it('should throw a ConflictException if the user is not following the target user', async () => {
      followerRepository.isFollowing.mockResolvedValue(false)
      await expect(followerService.unfollowUser('targetUserId', 'mockUserId')).rejects.toThrow(
        ConflictException
      )
    })
  })

  describe( 'isFollowing', () => {

    it('should return true if the user is following the target user', async () => {
      followerRepository.isFollowing.mockResolvedValue(true)
      const isFollowing = await followerService.isFollowing('targetUserId', 'mockUserId')
      expect(isFollowing).toBe(true)

    })

    it('should return false if the user is not following the target user', async () => {
      followerRepository.isFollowing.mockResolvedValue(false)
      const isFollowing = await followerService.isFollowing('targetUserId', 'mockUserId')
      expect(isFollowing).toBe(false)
    })
  })

  describe( 'areBothFollowingEachOther', () => {

    it('should should return true if both users are following each other', async () => {
      followerRepository.isFollowing.mockResolvedValue(true)
      const areBothFollowingEachOther = await followerService.areBothFollowingEachOther(
        'targetUserId',
        'mockUserId'
      )
      expect(areBothFollowingEachOther).toBe(true)
      expect(followerRepository.isFollowing).toHaveBeenCalledWith('targetUserId', 'mockUserId')
      expect(followerRepository.isFollowing).toHaveBeenCalledWith('mockUserId', 'targetUserId')
    })
  })

})

