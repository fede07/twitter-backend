import { Reaction, ReactionType } from '@prisma/client'

export interface ReactionService {
  createReaction: (postId: string, userId: string, type: ReactionType) => Promise<Reaction>
  getReactionsByUserId: (userId: string, reactionType: ReactionType) => Promise<Reaction[]>
  deleteReaction: (reactionId: string, userId: any, type: ReactionType) => Promise<void>
}
