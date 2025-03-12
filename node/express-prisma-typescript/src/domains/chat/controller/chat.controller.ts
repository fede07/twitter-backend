import { Request, Response, Router } from 'express'
import { db } from '@utils'
import { ChatServiceImpl } from '@domains/chat/service/chat.service.impl'
import ChatRepositoryImpl from '@domains/chat/repository/chat.repository.impl'

export const chatRouter = Router()

const service = new ChatServiceImpl(new ChatRepositoryImpl(db))

chatRouter.get('/chats', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const chats = await service.getChats(userId)

  return res.status(200).json(chats)
})

chatRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const chats = await service.getChatsUsers(userId)

  return res.status(200).json(chats)
})
