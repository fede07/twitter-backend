import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto';
import { PostRepository } from '../repository'
import { PostService } from '.'
import { validate } from 'class-validator'
import { ForbiddenException, NotFoundException } from '@utils'
import { CursorPagination } from '@types'
import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { UserRepository } from '@domains/user/repository'
import { generatePresignedUrl, getPublicUrl } from '@utils/s3-utils';
import * as console from 'node:console';

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

  async createPostPreSignedUrl (userId: string, data: CreatePostInputDTO): Promise<{ post: PostDTO; presignedUrls: { fileName: string; url: string }[] }> {
    await validate(data)

    const imageUrls: { fileName: string; presignedUrl: string; publicUrl: string }[] = [];

    if (data.images && Array.isArray(data.images)){
      for (const fileName of data.images) {
        const timestamp = Date.now();
        const key = `posts/${userId}/${timestamp}-${fileName}`;
        const presignedUrl = await generatePresignedUrl(key, 'image/jpeg');
        console.log('Key: ', key)
        console.log('PreSignedURL: ', presignedUrl)
        imageUrls.push({ fileName, presignedUrl, publicUrl: getPublicUrl(key) });
      }
    }
    data.images = imageUrls.map(({ publicUrl }) => publicUrl)
    const presignedUrls = imageUrls.map(({ fileName, presignedUrl }) => ({ fileName, url: presignedUrl }))

    const post = await this.repository.create(userId, data)

    return { post, presignedUrls}

  }

  async createComment (userId: string, parentId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    if (!parentId) throw new NotFoundException('parentId')
    const post = await this.repository.getById(parentId)
    if (!post) throw new NotFoundException('post')
    await validate(data)
    return await this.repository.createComment(userId, data, parentId)
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

  async getCommentByAuthorId (userId: any, authorId: string): Promise<PostDTO[]> {
    const isPrivate = await this.userRepository.isPrivate(authorId)
    if (isPrivate) {
      const isFollowing = await this.followerRepository.isFollowing(authorId, userId)
      if (!isFollowing) throw new ForbiddenException()
    }
    return await this.repository.getCommentByAuthorId(authorId)
  }

  async getCommentsByPostId (postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    console.log("service called")
    return await this.repository.getCommentsByPostId(postId, options)
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
