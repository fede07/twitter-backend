import { Reaction, ReactionType } from '@prisma/client'

export interface ReactionRepository {
  create: (postId: string, userId: string, reactionType: ReactionType) => Promise<Reaction>
  getByUserId: (userId: string, reactionType: ReactionType) => Promise<Reaction[]>
  delete: (postId: string, userId: string, type: ReactionType) => Promise<void>
  isLiked: (postId: string, userId: string) => Promise<boolean>
  isRetweeted: (postId: string, userId: string) => Promise<boolean>
}
