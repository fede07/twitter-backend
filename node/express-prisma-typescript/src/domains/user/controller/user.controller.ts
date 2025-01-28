import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db } from '@utils'

import { UserRepositoryImpl } from '../repository'
import { UserService, UserServiceImpl } from '../service'

export const userRouter = Router()

// Use dependency injection
const service: UserService = new UserServiceImpl(new UserRepositoryImpl(db))

userRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUserRecommendations(userId, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

userRouter.get('/me', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  const user = await service.getUser(userId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.get('/:userId', async (req: Request, res: Response) => {
  const { userId: otherUserId } = req.params

  const user = await service.getUser(otherUserId)

  return res.status(HttpStatus.OK).json(user)
})

userRouter.get('/by_username/:username', async (req: Request, res: Response) => {
  const { username } = req.params
  const { limit, skip } = req.query as Record<string, string>

  const users = await service.getUsersByUsername(username, { limit: Number(limit), skip: Number(skip) })

  return res.status(HttpStatus.OK).json(users)
})

userRouter.delete('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  await service.deleteUser(userId)

  return res.status(HttpStatus.OK)
})

userRouter.post('/profile-image', async (req: Request, res: Response) => {
  const { userId } = res.locals.context

  try {
    const uploadUrl = await service.generateProfileImageUrl(userId)

    return res.status(HttpStatus.OK).json({ uploadUrl })
  } catch (error) {
    console.error('Error generating profile image upload URL:', error)
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
  }
})

userRouter.post('/privacy', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { privacy } = req.body

  if (privacy !== false && privacy !== true) {
    return res.status(HttpStatus.BAD_REQUEST).send('INVALID_PRIVACY_SETTING')
  }

  try {
    const updatedUser = await service.updateUserPrivacy(userId, privacy)
    return res.status(HttpStatus.OK).send({ ...updatedUser, isPrivate: privacy })
  } catch (error) {
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Internal server error')
  }
})
