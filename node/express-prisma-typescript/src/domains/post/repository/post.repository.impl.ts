import { PrismaClient } from '@prisma/client'

import { CursorPagination } from '@types'

import { PostRepository } from '.'
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { UserViewDTO } from '@domains/user/dto'

export class PostRepositoryImpl implements PostRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, data: CreatePostInputDTO, parentId?: string): Promise<PostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        ...data,
        parentId
      }
    })
    return new PostDTO(post)
  }

  async getAllByDatePaginated (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        author: {
          followers: {
            some: {
              followerId: userId
            }
          }
        },
        deletedAt: null
      },
      include: {
        Reaction: true,
        comments: true
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc'
        },
        {
          id: 'asc'
        }
      ]
    })

    const postDTOs = posts.map((post) => new PostDTO(post))
    return await Promise.all(postDTOs.map(async (post) => await this.mapPostToExtendedPostDTO(post)))
  }

  async delete (postId: string): Promise<void> {
    await this.db.post.update({
      where: {
        id: postId
      },
      data: {
        deletedAt: new Date()
      }
    })
  }

  async getById (postId: string): Promise<PostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
        deletedAt: null
      }
    })
    return post != null ? new PostDTO(post) : null
  }

  async getByAuthorId (authorId: string): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId,
        deletedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
          }
        },
        Reaction: true,
        comments: true
      }
    })
    return await Promise.all(posts.map(async (post) => await this.mapPostToExtendedPostDTO(post)))
  }

  async getAuthorId (postId: string): Promise<string> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId
      },
      select: {
        authorId: true
      }
    })
    return post?.authorId ?? ''
  }

  async getCommentByAuthorId (authorId: string): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId,
        deletedAt: null,
        parentId: {
          not: null
        }
      }
    })
    return posts.map((post) => new PostDTO(post))
  }

  async getCommentsByPostId (postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const comments = await this.db.post.findMany({
      where: {
        parentId: postId,
        deletedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true
          }
        },
        Reaction: true,
        comments: true
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined
    })

    const extendedComments = comments.map(async (comment) => await this.mapPostToExtendedPostDTO(comment))

    const resolvedExtendedComments = await Promise.all(extendedComments)
    resolvedExtendedComments.sort((a, b) => {
      if (b.qtyLikes !== a.qtyLikes) {
        return b.qtyLikes - a.qtyLikes
      }
      return b.qtyRetweets - a.qtyRetweets
    })

    return resolvedExtendedComments
  }

  private async mapPostToExtendedPostDTO (post: PostDTO): Promise<ExtendedPostDTO> {
    const user = await this.db.user.findUnique({
      where: {
        id: post.authorId
      },
      select: {
        id: true,
        username: true,
        name: true,
        profileImage: true
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    const author = new UserViewDTO(user)

    const qtyLikes = await this.db.reaction.count({
      where: {
        postId: post.id,
        type: 'LIKE'
      }
    })
    const qtyRetweets = await this.db.reaction.count({
      where: {
        postId: post.id,
        type: 'RETWEET'
      }
    })
    console.log('qtyComments: ')
    console.log('parent: ', post.parentId)
    const qtyComments = await this.db.post.count({
      where: {
        parentId: post.id,
        deletedAt: null
      }
    })

    return new ExtendedPostDTO({
      ...post,
      author,
      qtyLikes,
      qtyRetweets,
      qtyComments
    })
  }
}
