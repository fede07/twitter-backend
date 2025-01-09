import { ReactionRepository } from '@domains/reaction/repository/reaction.repository'
import { ReactionService } from '@domains/reaction/service/reaction.service'
import { UserRepository } from '@domains/user/repository'
import { PostRepository } from '@domains/post/repository'
import { Reaction, ReactionType } from '@prisma/client'

export class ReactionServiceImpl implements ReactionService {
  constructor (
    private readonly reactionRepository: ReactionRepository,
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository
  ) {}

  async createReaction (postId: string, userId: string, type: ReactionType): Promise<Reaction> {
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new Error('User not found')
    }
    const post = await this.postRepository.getById(postId)
    if (!post) {
      throw new Error('Post not found')
    }
    return await this.reactionRepository.create(postId, userId, type)
  }

  async deleteReaction (postId: string, userId: string): Promise<void> {
    await this.reactionRepository.delete(postId, userId)
  }
}
