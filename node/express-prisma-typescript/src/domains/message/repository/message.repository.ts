import { MessageDto, MessageInputDto } from '@domains/message/dto'

export interface MessageRepository {
  saveMessage: (data: MessageInputDto, chatId: string) => Promise<MessageDto>
  getUserChatRooms: (userId: string) => Promise<string[]>
}
