import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
import 'express-async-errors'

import { db } from '@utils'

import { FollowerRepositoryImpl } from '@domains/follower/repository/follower.repository.impl'
import { FollowerService } from '@domains/follower/service/follower.service'
import { FollowerServiceImpl } from '@domains/follower/service/follower.service.impl'

export const followerRouter = Router()

const service: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))

followerRouter.post('/follow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { user_id } = req.params
  await service.followUser(user_id, userId)
  return res.status(HttpStatus.CREATED).json({
    message: 'User followed successfully'
  })
})

followerRouter.post('/unfollow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { user_id } = req.params
  await service.unfollowUser(user_id, userId)
  return res.status(HttpStatus.OK).json({
    message: 'User unfollowed successfully'
  })
})
