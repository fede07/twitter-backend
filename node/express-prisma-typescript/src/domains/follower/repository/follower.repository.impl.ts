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

  async getMutualFollowers (userId: string): Promise<string[]> {
    const mutualFollowers = await this.db.follow.findMany({
      where: {
        followerId: userId // El usuario sigue alguna persona ...
      },
      select: {
        followedId: true // Seleccionamos a quienes sigue
      }
    })

    const followedIds = mutualFollowers.map((follow) => follow.followedId)

    // Ahora filtramos por la relación inversa
    const result = await this.db.follow.findMany({
      where: {
        followerId: {
          in: followedIds // Ellos deben seguir también al usuario original
        },
        followedId: userId // Y el usuario debe también estar seguido por ellos
      },
      select: {
        followerId: true // Queremos los seguidores mutuos
      }
    })

    // Retornamos el ID de los mutual followers
    return result.map((follow) => follow.followerId)
  }
}
