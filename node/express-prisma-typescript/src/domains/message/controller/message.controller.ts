import { Router, Response, Request } from 'express'
import { MessageService } from '@domains/message/service/message.service'
import { MessageServiceImpl } from '@domains/message/service/message.service.impl'
import { MessageRepositoryImpl } from '@domains/message/repository'
import { db } from '@utils'
import 'express-async-errors'
import HttpStatus from 'http-status'
import ChatRepositoryImpl from '@domains/chat/repository/chat.repository.impl'

export const messageRouter = Router()

const service: MessageService = new MessageServiceImpl(new MessageRepositoryImpl(db), new ChatRepositoryImpl(db))

messageRouter.get('/:chatroomId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const chatroomId = req.params.chatroomId
  const { limit, before, after } = req.query as Record<string, string>

  const history = await service.getChatMessages(chatroomId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(history)
})

messageRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const userChatRooms = await service.getUserChatRooms(userId)
  return res.status(HttpStatus.OK).json(userChatRooms)
})
