import { FollowerService } from '@domains/follower/service/follower.service'
import { FollowerRepository } from '@domains/follower/repository/follower.repository'

export class FollowerServiceImpl implements FollowerService {
  constructor (private readonly followerRepository: FollowerRepository) {
  }

  async followUser (followedId: string, followerId: string): Promise<void> {
    await this.followerRepository.followUser(followedId, followerId)
  }

  async unfollowUser (followedId: string, followerId: string): Promise<void> {
    await this.followerRepository.unfollowUser(followedId, followerId)
  }
}
