import { FollowerService } from '@domains/follower/service/follower.service'
import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { ConflictException, ForbiddenException } from '@utils';

export class FollowerServiceImpl implements FollowerService {
  constructor (private readonly followerRepository: FollowerRepository) {}

  async followUser (followedId: string, followerId: string): Promise<void> {
    if (followedId === followerId) {
      throw new ForbiddenException()
    }
    if (await this.isFollowing(followedId, followerId)) throw new ConflictException('ALREADY_FOLLOWING')
    await this.followerRepository.followUser(followedId, followerId)
  }

  async unfollowUser (followedId: string, followerId: string): Promise<void> {
    if (followedId === followerId) {
      throw new ForbiddenException()
    }
    if (!(await this.isFollowing(followedId, followerId))) throw new ConflictException('NOT_FOLLOWING')
    await this.followerRepository.unfollowUser(followedId, followerId)
  }

  async isFollowing (followedId: string, followerId: string): Promise<boolean> {
    return await this.followerRepository.isFollowing(followedId, followerId)
  }
}
