import { CursorPagination } from '@types'
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO, parentId?: string) => Promise<ExtendedPostDTO>
  getAllByDatePaginated: (userId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<ExtendedPostDTO | null>
  getByAuthorId: (authorId: string) => Promise<ExtendedPostDTO[]>
  getPostsByAuthorIdPaginated: (authorId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  getAuthorId: (postId: string) => Promise<string>
  getCommentByAuthorId: (authorId: string) => Promise<PostDTO[]>
  getCommentsByPostId: (postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  getPostsByFollowed: (userId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
}
