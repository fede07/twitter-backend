import { PrismaClient, Reaction, ReactionType } from '@prisma/client'
import { ReactionRepository } from '@domains/reaction/repository/reaction.repository'
import { ExtendedPostDTO } from '@domains/post/dto'
import { mapPostToExtendedPostDTO } from '@utils'

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor (private readonly db: PrismaClient) {
  }

  async create (postId: string, userId: string, reactionType: ReactionType): Promise<Reaction> {
    return await this.db.reaction.create({
      data: {
        postId,
        userId,
        type: reactionType
      }
    })
  }

  async getByUserId (userId: string, reactionType: ReactionType): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        reactions: {
          some: {
            userId,
            type: reactionType
          }
        }
      },
      include: {
        author: true,
        reactions: true
      }
    })

    return await Promise.all(posts.map(async (post) => await mapPostToExtendedPostDTO(post)))
  }

  async delete (postId: string, userId: string, type: ReactionType): Promise<void> {
    await this.db.reaction.deleteMany({
      where: {
        postId,
        userId,
        type
      }
    })
  }

  async isLiked (postId: string, userId: string): Promise<boolean> {
    const reaction = await this.db.reaction.findFirst({
      where: {
        postId,
        userId,
        type: ReactionType.LIKE
      }
    })
    return reaction !== null
  }

  async isRetweeted (postId: string, userId: string): Promise<boolean> {
    const reaction = await this.db.reaction.findFirst({
      where: {
        postId,
        userId,
        type: ReactionType.RETWEET
      }
    })
    return reaction !== null
  }
}
