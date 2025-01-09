import { Reaction, ReactionType } from '@prisma/client'

export interface ReactionService {
  createReaction: (postId: string, userId: string, type: ReactionType) => Promise<Reaction>;
  // getReactions: (postId: string) => Promise<Reaction[]>
  deleteReaction: (reactionId: string, userId: any) => Promise<void>;
}
