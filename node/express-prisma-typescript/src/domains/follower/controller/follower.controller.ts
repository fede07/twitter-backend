import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
import 'express-async-errors'

import { db } from '@utils'

import { FollowerRepositoryImpl } from '@domains/follower/repository/follower.repository.impl'
import { FollowerService } from '@domains/follower/service/follower.service'
import { FollowerServiceImpl } from '@domains/follower/service/follower.service.impl'
import { UserRepositoryImpl } from '@domains/user/repository'

export const followerRouter = Router()

const service: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))

followerRouter.post('/follow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { user_id } = req.params

  if (!user_id) {
    return res.status(HttpStatus.BAD_REQUEST).send('INVALID_USER_ID')
  }

  if (userId === user_id) {
    return res.status(HttpStatus.BAD_REQUEST).send('SAME_USER')
  }

  await service.followUser(user_id, userId)
  return res.status(HttpStatus.CREATED).json({
    user: user_id,
    message: 'User followed successfully'
  })
})

followerRouter.post('/unfollow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { user_id } = req.params

  if (!user_id) {
    return res.status(HttpStatus.BAD_REQUEST).send('INVALID_USER_ID')
  }

  if (userId === user_id) {
    return res.status(HttpStatus.BAD_REQUEST).send('SAME_USER')
  }

  await service.unfollowUser(user_id, userId)
  return res.status(HttpStatus.OK).json({
    user: user_id,
    message: 'User unfollowed successfully'
  })
})
