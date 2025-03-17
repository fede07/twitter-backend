import { Reaction, ReactionType } from '@prisma/client'
import { ExtendedPostDTO } from '@domains/post/dto'

export interface ReactionRepository {
  create: (postId: string, userId: string, reactionType: ReactionType) => Promise<Reaction>
  getByUserId: (userId: string, reactionType: ReactionType) => Promise<ExtendedPostDTO[]>
  delete: (postId: string, userId: string) => Promise<void>
  isReacted: (reactionId: string, userId: string) => Promise<boolean>
  isLiked: (postId: string, userId: string) => Promise<boolean>
  isRetweeted: (postId: string, userId: string) => Promise<boolean>
}
