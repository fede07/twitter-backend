import { CursorPagination } from '@types'
import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto'

export interface PostRepository {
  create: (userId: string, data: CreatePostInputDTO, parentId?: string) => Promise<PostDTO>
  getAllByDatePaginated: (userId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  delete: (postId: string) => Promise<void>
  getById: (postId: string) => Promise<PostDTO | null>
  getByAuthorId: (authorId: string) => Promise<ExtendedPostDTO[]>
  getAuthorId: (postId: string) => Promise<string>
  getCommentByAuthorId: (authorId: string) => Promise<PostDTO[]>
  getCommentsByPostId: (postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
}
