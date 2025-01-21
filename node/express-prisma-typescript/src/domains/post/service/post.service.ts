import { CreatePostInputDTO, ExtendedPostDTO, PostDTO } from '../dto';
import { CursorPagination } from '@types';

export interface PostService {
  createPost: (userId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  createPostPreSignedUrl: (userId: string, body: CreatePostInputDTO) => Promise<{ post: PostDTO; presignedUrls: { fileName: string; url: string }[] }>
  createComment: (userId: string, parentId: string, body: CreatePostInputDTO) => Promise<PostDTO>
  deletePost: (userId: string, postId: string) => Promise<void>
  getPost: (userId: string, postId: string) => Promise<PostDTO>
  getLatestPosts: (userId: string, options: { limit?: number, before?: string, after?: string }) => Promise<ExtendedPostDTO[]>
  getPostsByAuthor: (userId: any, authorId: string) => Promise<ExtendedPostDTO[]>
  getCommentByAuthorId: (userId: any, authorId: string) => Promise<PostDTO[]>
  getCommentsByPostId: (postId: string, options: CursorPagination) => Promise<ExtendedPostDTO[]>
  getAuthorId: (postId: string) => Promise<string>
  canViewPost: (userId: string, postId: string) => Promise<boolean>
}
