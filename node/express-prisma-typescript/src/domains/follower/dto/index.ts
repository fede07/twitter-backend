
export class FollowDTO {
  constructor (follow: FollowDTO) {
    this.id = follow.id
    this.followedId = follow.followedId
    this.followerId = follow.followerId
    this.createdAt = follow.createdAt
    this.updatedAt = follow.updatedAt
    this.deletedAt = follow.deletedAt
  }

  id: string
  followedId: string
  followerId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}
