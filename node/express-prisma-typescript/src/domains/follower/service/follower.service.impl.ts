import { FollowerService } from '@domains/follower/service/follower.service'
import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { ConflictException, NotFoundException, ValidationException } from '@utils'
import { validate as isUuid } from 'uuid'
import { UserRepository } from '@domains/user/repository'

export class FollowerServiceImpl implements FollowerService {
  constructor (
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository
  ) {}

  async followUser (followedId: string, followerId: string): Promise<void> {
    if (!isUuid(followedId) || !isUuid(followerId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    if (followedId === followerId) throw new ConflictException('CANNOT_FOLLOW_YOURSELF')
    if (await this.userRepository.getById(followedId) === null) throw new NotFoundException('user')
    if (await this.isFollowing(followedId, followerId)) throw new ConflictException('ALREADY_FOLLOWING')
    await this.followerRepository.followUser(followedId, followerId)
  }

  async unfollowUser (followedId: string, followerId: string): Promise<void> {
    if (!isUuid(followedId) || !isUuid(followerId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    if (followedId === followerId) throw new ConflictException('CANNOT_FOLLOW_YOURSELF')
    if (await this.userRepository.getById(followedId) === null) throw new NotFoundException('user')
    if (!(await this.isFollowing(followedId, followerId))) throw new ConflictException('NOT_FOLLOWING')
    await this.followerRepository.unfollowUser(followedId, followerId)
  }

  async isFollowing (followedId: string, followerId: string): Promise<boolean> {
    return await this.followerRepository.isFollowing(followedId, followerId)
  }

  async areBothFollowingEachOther (followedId: string, followerId: string): Promise<boolean> {
    const isFollowing = await this.isFollowing(followedId, followerId)
    const areFollowingEachOther = await this.isFollowing(followerId, followedId)
    return isFollowing && areFollowingEachOther
  }
}
