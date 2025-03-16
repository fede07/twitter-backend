
export class ReactionDto {
  constructor (reaction: ReactionDto) {
    this.id = reaction.id
    this.type = reaction.type
    this.userId = reaction.userId
    this.postId = reaction.postId
  }

  id: string
  type: string
  userId: string
  postId: string
}
