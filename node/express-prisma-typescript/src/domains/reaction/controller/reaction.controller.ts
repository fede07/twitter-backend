import { Request, Response, Router } from 'express'

import { db } from '@utils'

import 'express-async-errors'
import HttpStatus from 'http-status'
import { ReactionService, ReactionServiceImpl } from '@domains/reaction/service'
import { ReactionRepositoryImpl } from '@domains/reaction/repository/reaction.repository.impl'
import { UserRepositoryImpl } from '@domains/user/repository'
import { PostRepositoryImpl } from '@domains/post/repository'
import { ReactionType } from '@prisma/client'

export const reactionRouter = Router()

const service: ReactionService = new ReactionServiceImpl(
  new ReactionRepositoryImpl(db),
  new UserRepositoryImpl(db),
  new PostRepositoryImpl(db)
)

reactionRouter.get('/', async (req: Request, res: Response) => {
  return res.status(HttpStatus.OK).json({})
})

reactionRouter.get('/:post_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { post_id } = req.params
  const { type } = req.body

  if (type !== 'LIKE' && type !== 'RETWEET') {
    return res.status(HttpStatus.BAD_REQUEST).send('Invalid reaction type')
  }

  if (type === 'LIKE') {
    const isLiked = await service.isLiked(post_id, userId)
    return res.status(HttpStatus.OK).json({
      isLiked
    })
  } else {
    const isRetweeted = await service.isRetweeted(post_id, userId)
    return res.status(HttpStatus.OK).json({
      isRetweeted
    })
  }
})

reactionRouter.post('/:post_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { post_id } = req.params
  const { type } = req.body

  if (type !== 'LIKE' && type !== 'RETWEET') {
    return res.status(HttpStatus.BAD_REQUEST).send('Invalid reaction type')
  }

  await service.createReaction(post_id, userId, type)
  return res.status(HttpStatus.CREATED).json({
    post_id
  })
})

reactionRouter.get('/likes/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  const reactions = await service.getReactionsByUserId(userId, ReactionType.LIKE)
  return res.status(HttpStatus.OK).json(reactions)
})

reactionRouter.get('/retweets/:userId', async (req: Request, res: Response) => {
  const { userId } = req.params
  const reactions = await service.getReactionsByUserId(userId, ReactionType.RETWEET)
  return res.status(HttpStatus.OK).json(reactions)
})

reactionRouter.delete('/:reaction_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { reaction_id } = req.params

  await service.deleteReaction(reaction_id, userId)
  return res.status(HttpStatus.NO_CONTENT).send()
})
