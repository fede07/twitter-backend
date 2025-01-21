import { PrismaClient } from '@prisma/client';

import { CursorPagination } from '@types';

import { PostRepository } from '.';
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto';

export class PostRepositoryImpl implements PostRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(userId: string, data: CreatePostInputDTO): Promise<PostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        ...data,
      },
    });
    return new PostDTO(post);
  }

  async createComment(userId: string, data: CreatePostInputDTO, parentId: string): Promise<PostDTO> {
    const post = await this.db.post.create({
      data: {
        authorId: userId,
        ...data,
        parentId,
      },
    });
    return new PostDTO(post);
  }

  async getAllByDatePaginated(userId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        author: {
          followers: {
            some: {
              followerId: userId, // User follows the author
            },
          },
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
        Reaction: true,
        comments: true,
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          id: 'asc',
        },
      ],
    });

    return posts.map((post) => {
      const qtyLikes = post.Reaction.filter((r) => r.type === 'LIKE').length;
      const qtyRetweets = post.Reaction.filter((r) => r.type === 'RETWEET').length;
      const qtyComments = post.comments?.length || 0;
      return new ExtendedPostDTO({
        ...post,
        author: post.author,
        qtyLikes,
        qtyRetweets,
        qtyComments,
      });
    });
  }

  async delete(postId: string): Promise<void> {
    await this.db.post.update({
      where: {
        id: postId,
      },
      data: {
        content: '[DELETED]',
        images: [],
        deletedAt: new Date(),
      },
    });
  }

  async getById(postId: string): Promise<PostDTO | null> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
      },
    });
    return post != null ? new PostDTO(post) : null;
  }

  async getByAuthorId(authorId: string): Promise<ExtendedPostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          }
        },
        Reaction: true,
        comments: true,
      }
    });
    return posts.map((post) => {
      const qtyLikes = post.Reaction.filter((r) => r.type === 'LIKE').length;
      const qtyRetweets = post.Reaction.filter((r) => r.type === 'RETWEET').length;
      const qtyComments = post.comments?.length || 0;
      return new ExtendedPostDTO({
        ...post,
        author: post.author,
        qtyLikes,
        qtyRetweets,
        qtyComments,
      })
    })
  }

  async getAuthorId(postId: string): Promise<string> {
    const post = await this.db.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });
    return post?.authorId ?? '';
  }

  async getCommentByAuthorId(authorId: string): Promise<PostDTO[]> {
    const posts = await this.db.post.findMany({
      where: {
        authorId,
        parentId: {
          not: null,
        },
      },
    });
    return posts.map((post) => new PostDTO(post));
  }

  async getCommentsByPostId(postId: string, options: CursorPagination): Promise<ExtendedPostDTO[]> {
    const comments = await this.db.post.findMany({
      where: {
        parentId: postId,
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            name: true,
            profileImage: true,
          },
        },
        Reaction: true,
        comments: true,
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
    })

    const extendedComments = comments.map((comment) => {
      const qtyLikes = comment.Reaction.filter((r) => r.type === 'LIKE').length;
      const qtyRetweets = comment.Reaction.filter((r) => r.type === 'RETWEET').length;
      const qtyComments = comment.comments?.length || 0;
      return new ExtendedPostDTO({
        ...comment,
        author: comment.author,
        qtyLikes,
        qtyRetweets,
        qtyComments,
      })
    })

    extendedComments.sort((a, b) => {
      if (b.qtyLikes !== a.qtyLikes) {
        return b.qtyLikes - a.qtyLikes;
      }
      return b.qtyRetweets - a.qtyRetweets;
    })

    return extendedComments;
  }
}
