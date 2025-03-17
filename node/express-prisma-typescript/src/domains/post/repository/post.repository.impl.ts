import { PrismaClient } from '@prisma/client'
import { CursorPagination } from '@types'
import { PostRepository } from '.'
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { mapPostToExtendedPostDTO } from '@utils'

export class PostRepositoryImpl implements PostRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (userId: string, data: CreatePostInputDTO, parentId?: string): Promise<ExtendedPostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        ...data,
        parentId
      }
    })

    return await mapPostToExtendedPostDTO(new PostDTO(post))
  }

  async getAllByDatePaginated (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        OR: [
          {
            author: {
              followers: {
                some: {
                  followerId: userId
                }
              }
            }
          },
          {
            author: {
              isPrivate: false
            }
          }
        ],
        AND: [
          {
            authorId: {
              not: userId
            }
          }
        ],
        deletedAt: null
      },
      include: {
        reactions: true,
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
    return await Promise.all(postDTOs.map(async (post) => await mapPostToExtendedPostDTO(post)))
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

  async getById (postId: string): Promise<ExtendedPostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
        deletedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePicture: true
          }
        },
        reactions: true,
        comments: true
      }
    })
    return post != null ? await mapPostToExtendedPostDTO(new PostDTO(post)) : null
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
            profilePicture: true
          }
        },
        reactions: true,
        comments: true
      },
      orderBy: [
        {
          createdAt: 'desc'
        }
      ]
    })
    return await Promise.all(posts.map(async (post) => await mapPostToExtendedPostDTO(post)))
  }

  async getPostsByAuthorIdPaginated (authorId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
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
            profilePicture: true
          }
        },
        reactions: true,
        comments: true
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc'
        }
      ]
    })
    return await Promise.all(posts.map(async (post) => await mapPostToExtendedPostDTO(post)))
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

  async getPostsByFollowed (userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const followed = await this.db.follow.findMany({
      where: {
        followerId: userId
      },
      select: {
        followedId: true
      }
    })
    const followedIds = followed.map(f => f.followedId)
    const posts = await this.db.post.findMany({
      where: {
        authorId: {
          in: followedIds
        },
        deletedAt: null
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profilePicture: true
          }
        },
        reactions: true,
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

    const extendedPosts = posts.map(async (post) => await mapPostToExtendedPostDTO(post))
    return await Promise.all(extendedPosts)
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
            profilePicture: true
          }
        },
        reactions: true,
        comments: true
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined
    })

    const extendedComments = comments.map(async (comment) => await mapPostToExtendedPostDTO(comment))

    const resolvedExtendedComments = await Promise.all(extendedComments)
    resolvedExtendedComments.sort((a, b) => {
      if (b.qtyLikes !== a.qtyLikes) {
        return b.qtyLikes - a.qtyLikes
      }
      return b.qtyRetweets - a.qtyRetweets
    })

    return resolvedExtendedComments
  }
}
