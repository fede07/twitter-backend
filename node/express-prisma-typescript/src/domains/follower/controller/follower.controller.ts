import { Request, Response, Router } from 'express'
import { FollowerService } from '@domains/follower/service/follower.service'
import HttpStatus from 'http-status'
import 'express-async-errors'

import { db } from '@utils'
import { FollowerServiceImpl } from '@domains/follower/service/follower.service.impl'
import { FollowerRepositoryImpl } from '@domains/follower/repository/follower.repository.impl'

export const followerRouter = Router()

const service: FollowerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db))

/**
 * @swagger
 * /api/followers/follow/{user_id}:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Followers
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: User followed successfully
 */

followerRouter.post('/follow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { followedId } = req.params
  await service.followUser(followedId, userId)
  return res.status(HttpStatus.CREATED).json({
    followedUserId: followedId
  })
})

/**
 * @swagger
 * /api/followers/unfollow/{user_id}:
 *    post:
 *      summary: Unfollow a user
 *      tags:
 *       - Followers
 *      parameters:
 *        - in: path
 *          name: user_id
 *          required: true
 *          schema:
 *            type: string
 *      responses:
 *        200:
 *          description: User unfollowed successfully
 */

followerRouter.post('/unfollow/:user_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { followedId } = req.params
  await service.unfollowUser(followedId, userId)
  return res.status(HttpStatus.OK).json({
    followedUserId: followedId
  })
})
