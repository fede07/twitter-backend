import { PrismaClient } from '@prisma/client'
import { MessageRepository } from './message.repository'
import { MessageDto, MessageInputDto } from '@domains/message/dto'
import { CursorPagination } from '@types'

export class MessageRepositoryImpl implements MessageRepository {
  constructor (private readonly db: PrismaClient) {}

  async saveMessage (data: MessageInputDto, chatId: string): Promise<MessageDto> {
    const message = await this.db.message.create({
      data: {
        text: data.text,
        senderId: data.userId,
        recipientId: data.recipientId,
        roomId: data.roomId,
        chatId,
        createdAt: new Date()
      }
    })
    return new MessageDto(message)
  }

  async getUserChatRooms (userId: string): Promise<string[]> {
    const rooms = await this.db.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId }
        ]
      },
      select: {
        roomId: true
      },
      distinct: ['roomId']
    })
    return rooms.map(r => r.roomId)
  }

  async getChatMessages (roomId: string, options: CursorPagination): Promise<MessageDto[]> {
    const messages = await this.db.message.findMany({
      where: {
        roomId
      },
      cursor: options.after ? { id: options.after } : options.before ? { id: options.before } : undefined,
      skip: options.after ?? options.before ? 1 : undefined,
      take: options.limit ? (options.before ? -options.limit : options.limit) : undefined,
      orderBy: [
        {
          createdAt: 'asc'
        }
      ]
    })
    return messages.map(m => new MessageDto(m))
  }
}
