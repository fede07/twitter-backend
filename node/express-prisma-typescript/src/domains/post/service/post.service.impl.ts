import { CreatePostInputDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { UserRepository } from '@domains/user/repository'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createPost (userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    await validate(data)
    return await this.repository.create(userId, data)
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    const canViewPost = await this.canViewPost(userId, postId)
    if (!canViewPost) throw new ForbiddenException()
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<PostDTO[]> {
    // TODO: filter post search to return posts from authors that the user follows
    return await this.repository.getAllByDatePaginated(userId, options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<PostDTO[]> {
    // TODO: throw exception when the author has a private profile and the user doesn't follow them
    const isPrivate = await this.userRepository.isPrivate(authorId)
    if (isPrivate) {
      const isFollowing = await this.followerRepository.isFollowing(authorId, userId)
      if (!isFollowing) throw new ForbiddenException()
    }
    return await this.repository.getByAuthorId(authorId)
  }

  async getAuthorId (postId: string): Promise<string> {
    return await this.repository.getAuthorId(postId)
  }

  async canViewPost (userId: string, postId: string): Promise<boolean> {
    const isPrivate = await this.userRepository.isPrivate(userId)
    if (!isPrivate) return true
    const authorId = await this.repository.getAuthorId(postId)
    return await this.followerRepository.isFollowing(authorId, userId)
  }
}
