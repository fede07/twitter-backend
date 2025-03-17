import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'
import { CursorPagination } from '@types'

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO, parentId?: string) => Promise<{ post: ExtendedPostDTO, images: Array<{ fileName: string, url: string }> }>
  deletePost: (userId: string, postId: string) => Promise<void>
  getPost: (userId: string, postId: string) => Promise<ExtendedPostDTO>
  getLatestPosts: (userId: string, options: { limit?: number, before?: string, after?: string }) => Promise<ExtendedPostDTO[]>
  getPostsByAuthor: (userId: any, authorId: string) => Promise<ExtendedPostDTO[]>
  getPostsByAuthorPaginated: (userId: any, authorId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  getCommentByAuthorId: (userId: any, authorId: string) => Promise<PostDTO[]>
  getCommentsByPostId: (postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  getAuthorId: (postId: string) => Promise<string>
  getPostsByFollowed: (userId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  canViewPost: (userId: string, postId: string) => Promise<boolean>
}
