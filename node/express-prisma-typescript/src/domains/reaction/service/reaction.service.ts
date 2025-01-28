import { Reaction, ReactionType } from '@prisma/client'
import { ExtendedPostDTO } from '@domains/post/dto'

export interface ReactionService {
  createReaction: (postId: string, userId: string, type: ReactionType) => Promise<Reaction>
  getReactionsByUserId: (userId: string, reactionType: ReactionType) => Promise<ExtendedPostDTO[]>
  deleteReaction: (reactionId: string, userId: any, type: ReactionType) => Promise<void>
}
