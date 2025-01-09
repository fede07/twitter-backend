import { PrismaClient, Reaction, ReactionType } from '@prisma/client'
import { ReactionRepository } from '@domains/reaction/repository/reaction.repository'

export class ReactionRepositoryImpl implements ReactionRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (postId: string, userId: string, reactionType: ReactionType): Promise<Reaction> {
    return await this.db.reaction.create({
      data: {
        postId,
        userId,
        type: reactionType
      }
    })
  }

  async delete (postId: string, userId: string): Promise<void> {
    await this.db.reaction.deleteMany({
      where: {
        postId,
        userId
      }
    })
  }
}
