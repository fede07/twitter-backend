import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
import 'express-async-errors'
import { PostService, PostServiceImpl } from '@domains/post/service'
import { PostRepositoryImpl } from '@domains/post/repository'
import { db } from '@utils'
import { FollowerRepositoryImpl } from '@domains/follower/repository/follower.repository.impl'
import { UserRepositoryImpl } from '@domains/user/repository'

export const commentRouter = Router()
const service: PostService = new PostServiceImpl(new PostRepositoryImpl(db), new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))

commentRouter.get('/:postId', async (req: Request, res: Response) => {
  const { postId } = req.params
  const { limit, before, after } = req.query as Record<string, string>

  const comments = await service.getCommentsByPostId(postId, { limit: Number(limit), before, after })
  return res.status(HttpStatus.OK).json(comments)
})
