export class FollowerDTO {
  constructor (follower: FollowerDTO) {
    this.id = follower.id
    this.followedId = follower.followedId
    this.createdAt = follower.createdAt
  }

  id: string
  followedId: string
  createdAt: Date
}

export class ViewFollowerDTO {
  constructor (follower: ViewFollowerDTO) {
    this.id = follower.id
    this.name = follower.name
    this.username = follower.username
    this.profilePicture = follower.profilePicture
  }

  id: string
  name: string | null
  username: string | null
  profilePicture: string | null
}
