import { PrismaClient } from '@prisma/client'
import { MessageRepository } from './message.repository'
import { MessageDto, MessageInputDto } from '@domains/message/dto'

export class MessageRepositoryImpl implements MessageRepository {
  constructor (private readonly db: PrismaClient) {}

  async saveMessage (data: MessageInputDto): Promise<MessageDto> {
    const message = await this.db.message.create({
      data: {
        text: data.text,
        senderId: data.userId,
        recipientId: data.recipientId,
        roomId: data.roomId,
        createdAt: new Date()
      }
    })
    return new MessageDto(message)
  }
}
