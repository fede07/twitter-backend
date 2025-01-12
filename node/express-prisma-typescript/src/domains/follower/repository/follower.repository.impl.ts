import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { PrismaClient } from '@prisma/client'

export class FollowerRepositoryImpl implements FollowerRepository {
  constructor (private readonly db: PrismaClient) {
  }

  async followUser (followedId: string, followerId: string): Promise<void> {
    await this.db.follow.create({
      data: {
        followedId,
        followerId
      }
    })
  }

  async unfollowUser (followedId: string, followerId: string): Promise<void> {
    const followId = await this.db.follow.findFirst({
      where: {
        followedId,
        followerId
      },
      select: { id: true }
    })
    if (followId) {
      await this.db.follow.delete({
        where: {
          id: followId.id
        }
      })
    }
  }

  async isFollowing (followedId: string, followerId: string): Promise<boolean> {
    const follow = await this.db.follow.findFirst({
      where: {
        followedId,
        followerId
      },
      select: { id: true }
    })
    return follow !== null
  }
}
