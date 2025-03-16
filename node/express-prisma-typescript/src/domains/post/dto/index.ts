import { ArrayMaxSize, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator'
import { UserViewDTO } from '@domains/user/dto'
import { ReactionDto } from '@domains/reaction/dto'

export class CreatePostInputDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    content!: string

  @IsOptional()
  @ArrayMaxSize(4)
  @IsString({ each: true })
    images?: string[]
}

export class PostDTO {
  constructor (post: PostDTO) {
    this.id = post.id
    this.authorId = post.authorId
    this.content = post.content
    this.images = post.images
    this.createdAt = post.createdAt
    this.parentId = post.parentId
  }

  id: string
  authorId: string
  content: string
  images: string[]
  createdAt: Date
  parentId?: string | null
}

export class ExtendedPostDTO extends PostDTO {
  constructor (post: ExtendedPostDTO) {
    super(post)
    this.author = post.author
    this.reactions = post.reactions
    this.qtyComments = post.qtyComments
    this.qtyLikes = post.qtyLikes
    this.qtyRetweets = post.qtyRetweets
  }

  author!: UserViewDTO
  reactions!: ReactionDto[]
  qtyComments!: number
  qtyLikes!: number
  qtyRetweets!: number
}
