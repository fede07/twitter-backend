import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
import 'express-async-errors'
import { PostService, PostServiceImpl } from '@domains/post/service'
import { PostRepositoryImpl } from '@domains/post/repository'
import { db } from '@utils'
import { FollowerRepositoryImpl } from '@domains/follower/repository/follower.repository.impl';
import { UserRepositoryImpl } from '@domains/user/repository'
import * as console from 'node:console';


export const commentRouter = Router()
const service: PostService = new PostServiceImpl(new PostRepositoryImpl(db), new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))

commentRouter.get('/:postId', async (req: Request, res: Response) => {
  // const { userId } = res.locals.context
  const { postId } = req.params
  const { limit, before, after } = req.query as Record<string, string>


  console.log('Calling Service')
  const comments = await service.getCommentsByPostId(postId, { limit: Number(limit), before, after })
  console.log("received comments: ", comments)
  return res.status(HttpStatus.OK).json(comments)
})
