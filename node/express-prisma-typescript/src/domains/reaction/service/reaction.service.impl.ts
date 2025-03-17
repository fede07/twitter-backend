import { ReactionRepository } from '@domains/reaction/repository/reaction.repository'
import { ReactionService } from '@domains/reaction/service/reaction.service'
import { UserRepository } from '@domains/user/repository'
import { PostRepository } from '@domains/post/repository'
import { Reaction, ReactionType } from '@prisma/client'
import { ConflictException, NotFoundException, ValidationException } from '@utils'
import { ExtendedPostDTO } from '@domains/post/dto'
import { validate as isUuid } from 'uuid'

export class ReactionServiceImpl implements ReactionService {
  constructor (
    private readonly reactionRepository: ReactionRepository,
    private readonly userRepository: UserRepository,
    private readonly postRepository: PostRepository
  ) {}

  async createReaction (postId: string, userId: string, type: ReactionType): Promise<Reaction> {
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new NotFoundException('user')
    }
    const post = await this.postRepository.getById(postId)
    if (!post) {
      throw new NotFoundException('post')
    }

    if (type === ReactionType.LIKE) {
      const isLiked = await this.reactionRepository.isLiked(postId, userId)
      if (isLiked) throw new ConflictException('ALREADY_LIKED')
    } else if (type === ReactionType.RETWEET) {
      const isRetweeted = await this.reactionRepository.isRetweeted(postId, userId)
      if (isRetweeted) throw new ConflictException('ALREADY_RETWEETED')
    }
    return await this.reactionRepository.create(postId, userId, type)
  }

  async getReactionsByUserId (userId: string, reactionType: ReactionType): Promise<ExtendedPostDTO[]> {
    const user = await this.userRepository.getById(userId)
    if (!user) {
      throw new NotFoundException('user')
    }
    return await this.reactionRepository.getByUserId(userId, reactionType)
  }

  async isLiked (postId: string, userId: string): Promise<boolean> {
    return await this.reactionRepository.isLiked(postId, userId)
  }

  async isRetweeted (postId: string, userId: string): Promise<boolean> {
    return await this.reactionRepository.isRetweeted(postId, userId)
  }

  async deleteReaction (reactionId: string, userId: string): Promise<void> {
    if (!reactionId) throw new NotFoundException('reactionId')
    if (!isUuid(reactionId)) {
      throw new ValidationException([{ message: 'INVALID_UUID' }])
    }

    if (!userId) throw new NotFoundException('userId')
    if (!isUuid(userId)) {
      throw new ValidationException([{ message: 'INVALID_UUID' }])
    }

    const isReacted: boolean = await this.reactionRepository.isReacted(reactionId, userId)
    if (!isReacted) throw new ConflictException('NOT_REACTED')

    await this.reactionRepository.delete(reactionId, userId)
  }
}
