import { MessageService } from '@domains/message/service/message.service'
import { MessageDto, MessageInputDto } from '@domains/message/dto'
import { MessageRepository } from '@domains/message/repository'
import { ChatRepository } from '@domains/chat/repository/chat.repository'
import { generateRoomId } from '@utils/chat'

export class MessageServiceImpl implements MessageService {
  constructor (
    private readonly repository: MessageRepository,
    private readonly chatRepository: ChatRepository
  ) {}

  async saveMessage (message: MessageInputDto): Promise<MessageDto> {
    const roomId = generateRoomId(message.userId, message.recipientId)
    const chat = await this.chatRepository.getChatByRoomId(message.userId, roomId)

    if (!chat) throw new Error('Chat not found')

    return await this.repository.saveMessage(message, chat.id)
  }

  async getUserChatRooms (userId: string): Promise<string[]> {
    return await this.repository.getUserChatRooms(userId)
  }
}
