import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { FollowerServiceImpl } from '@domains/follower/service/follower.service.impl'
import { ConflictException, NotFoundException, ValidationException } from '@utils'
import * as uuidUtils from 'uuid'
import { UserRepository } from '@domains/user/repository'

describe('FollowerServiceImpl', () => {
  let followerService: FollowerServiceImpl
  let followerRepository: jest.Mocked<FollowerRepository>
  let userRepository: jest.Mocked<UserRepository>

  beforeEach(() => {
    followerRepository = {
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      isFollowing: jest.fn()
    } as unknown as jest.Mocked<FollowerRepository>

    userRepository = {
      getById: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      getRecommendedUsersPaginated: jest.fn(),
      getByEmailOrUsername: jest.fn(),
      getUsersByUsername: jest.fn(),
      isPrivate: jest.fn(),
      updateProfileImage: jest.fn(),
      updatePrivacy: jest.fn()
    } satisfies jest.Mocked<UserRepository>

    followerService = new FollowerServiceImpl(followerRepository, userRepository)
  })

  describe('followUser', () => {
    it('should allow a user to follow another user', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)

      followerRepository.isFollowing.mockResolvedValue(false)
      userRepository.getById.mockResolvedValue({ id: 'mockUserId', name: 'Mock Name', username: 'mockuser', profileImage: 'mockImageUrl' })
      await followerService.followUser('targetUserId', 'mockUserId')

      expect(followerRepository.followUser).toHaveBeenCalledWith('targetUserId', 'mockUserId')
    })

    it('should not allow a user to follow themselves', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)

      await expect(followerService.followUser('mockUserId', 'mockUserId')).rejects.toThrow(ConflictException)
    })

    it('should throw a ConflictException if the user is already following the target user', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)
      userRepository.getById.mockResolvedValue({ id: 'mockUserId', name: 'Mock Name', username: 'mockuser', profileImage: 'mockImageUrl' })
      followerRepository.isFollowing.mockResolvedValue(true)
      await expect(followerService.followUser('targetUserId', 'mockUserId')).rejects.toThrow(ConflictException)
    })

    it('should throw a ConflictException if the user does not exist', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)
      userRepository.getById.mockResolvedValue(null)
      await expect(followerService.followUser('targetUserId', 'mockUserId')).rejects.toThrow(NotFoundException)
    })

    it('should throw a ValidationError if the user id is invalid', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(false)
      await followerRepository.followUser('targetUserId', 'mockUserId')
      await expect(followerService.followUser('targetUserId', 'mockUserId')).rejects.toThrow(ValidationException)
    })
  })

  describe('unfollowUser', () => {
    it('should allow a user to unfollow another user', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)
      followerRepository.isFollowing.mockResolvedValue(true)
      userRepository.getById.mockResolvedValue({ id: 'mockUserId', name: 'Mock Name', username: 'mockuser', profileImage: 'mockImageUrl' })
      await followerService.unfollowUser('targetUserId', 'mockUserId')

      expect(followerRepository.unfollowUser).toHaveBeenCalledWith('targetUserId', 'mockUserId')
    })

    it('should not allow a user to unfollow themselves', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)

      await expect(followerService.unfollowUser('mockUserId', 'mockUserId')).rejects.toThrow(ConflictException)
    })

    it('should throw a ConflictException if the user is not following the target user', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)
      followerRepository.isFollowing.mockResolvedValue(false)
      await expect(followerService.unfollowUser('targetUserId', 'mockUserId')).rejects.toThrow(
        ConflictException
      )
    })

    it('should throw a ConflictException if the user does not exist', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)
      userRepository.getById.mockResolvedValue(null)
      await expect(followerService.unfollowUser('targetUserId', 'mockUserId')).rejects.toThrow(NotFoundException)
    })

    it('should throw a ValidationError if the user id is invalid', async () => {
      jest.spyOn(uuidUtils, 'validate').mockReturnValue(false)
      await followerRepository.unfollowUser('targetUserId', 'mockUserId')
      await expect(followerService.unfollowUser('targetUserId', 'mockUserId')).rejects.toThrow(ValidationException)
    })
  })

  describe('isFollowing', () => {
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

  describe('areBothFollowingEachOther', () => {
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
