import { PostDTO } from '@domains/post/dto'

export class UserDTO {
  constructor (user: UserDTO) {
    this.id = user.id
    this.name = user.name
    this.createdAt = user.createdAt
    this.profilePicture = user.profilePicture
  }

  id: string
  name: string | null
  createdAt: Date
  profilePicture: string | null
}

export class ExtendedUserDTO extends UserDTO {
  constructor (user: ExtendedUserDTO) {
    super(user)
    this.email = user.email
    this.name = user.name
    this.password = user.password
  }

  email!: string
  username!: string
  password!: string
}
export class UserViewDTO {
  constructor (user: UserViewDTO) {
    this.id = user.id
    this.name = user.name
    this.username = user.username
    this.profilePicture = user.profilePicture
    this.isPrivate = user.isPrivate
    this.createdAt = user.createdAt
  }

  id: string
  name: string | null
  username: string
  profilePicture?: string | null
  isPrivate: boolean
  createdAt: Date
}

export class UserFullDTO extends UserViewDTO {
  constructor (user: UserFullDTO) {
    super(user)
    this.posts = user.posts
    this.followers = user.followers
    this.following = user.following
  }

  posts: PostDTO[]
  followers: UserViewDTO[]
  following: UserViewDTO[]
}
