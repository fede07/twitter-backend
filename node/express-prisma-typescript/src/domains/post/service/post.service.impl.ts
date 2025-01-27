import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException, ValidationException } from '@utils'
import { CursorPagination } from '@types'
import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { UserRepository } from '@domains/user/repository'
import { generatePresignedUrl, getPublicUrl } from '@utils/s3-utils'
import { validate as isUuid } from 'uuid'

export class PostServiceImpl implements PostService {
  constructor (
    private readonly repository: PostRepository,
    private readonly followerRepository: FollowerRepository,
    private readonly userRepository: UserRepository
  ) {}

  async createPost (userId: string, data: CreatePostInputDTO, parentId?: string): Promise<{ post: PostDTO, presignedUrls: Array<{ fileName: string, url: string }> }> {
    if (!isUuid(userId)) {
      throw new ValidationException([{ message: 'INVALID_UUID' }])
    }
    if (parentId) {
      if (!isUuid(parentId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
      const parentPost = await this.repository.getById(parentId)
      if ((parentPost === null)) throw new NotFoundException('post')
    }
    await validate(data)
    const imageUrls: Array<{ fileName: string, presignedUrl: string, key: string }> = []

    if (data.images && Array.isArray(data.images)) {
      for (const fileName of data.images) {
        const timestamp = Date.now()
        const key = `users/${userId}/posts/${timestamp}-${fileName}`
        const presignedUrl = await generatePresignedUrl(key, 'image/jpeg')

        console.log('PublicURL', getPublicUrl(key))

        imageUrls.push({ fileName, presignedUrl, key })
      }
    }
    data.images = imageUrls.map(({ key }) => key)
    const presignedUrls = imageUrls.map(({ fileName, presignedUrl }) => ({ fileName, url: presignedUrl }))

    const post = await this.repository.create(userId, data, parentId)

    return { post, presignedUrls }
  }

  async deletePost (userId: string, postId: string): Promise<void> {
    if (!isUuid(postId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    if (post.authorId !== userId) throw new ForbiddenException()
    await this.repository.delete(postId)
  }

  async getPost (userId: string, postId: string): Promise<PostDTO> {
    if (!isUuid(postId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    const post = await this.repository.getById(postId)
    if (!post) throw new NotFoundException('post')
    const canViewPost = await this.canViewPost(userId, postId)
    if (!canViewPost) throw new ForbiddenException()
    return post
  }

  async getLatestPosts (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    return await this.repository.getAllByDatePaginated(userId, options)
  }

  async getPostsByAuthor (userId: any, authorId: string): Promise<ExtendedPostDTO[]> {
    if (!isUuid(authorId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    const isPrivate = await this.userRepository.isPrivate(authorId)
    if (isPrivate) {
      const isFollowing = await this.followerRepository.isFollowing(authorId, userId)
      if (!isFollowing) throw new ForbiddenException()
    }
    return await this.repository.getByAuthorId(authorId)
  }

  async getCommentByAuthorId (userId: any, authorId: string): Promise<PostDTO[]> {
    if (!isUuid(authorId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    const isPrivate = await this.userRepository.isPrivate(authorId)
    if (isPrivate) {
      const isFollowing = await this.followerRepository.isFollowing(authorId, userId)
      if (!isFollowing) throw new ForbiddenException()
    }
    return await this.repository.getCommentByAuthorId(authorId)
  }

  async getCommentsByPostId (postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    return await this.repository.getCommentsByPostId(postId, options)
  }

  async getAuthorId (postId: string): Promise<string> {
    if (!isUuid(postId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    return await this.repository.getAuthorId(postId)
  }

  async canViewPost (userId: string, postId: string): Promise<boolean> {
    if (!isUuid(postId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    const authorId = await this.repository.getAuthorId(postId)
    const isPrivate = await this.userRepository.isPrivate(authorId)
    if (!isPrivate) return true
    return await this.followerRepository.isFollowing(authorId, userId)
  }
}
