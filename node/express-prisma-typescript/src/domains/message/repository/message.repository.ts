import { MessageDto, MessageInputDto } from '@domains/message/dto'
import { CursorPagination } from '@types'

export interface MessageRepository {
  saveMessage: (data: MessageInputDto, chatId: string) => Promise<MessageDto>
  getUserChatRooms: (userId: string) => Promise<string[]>
  getChatMessages: (chatId: string, options: CursorPagination) => Promise<MessageDto[]>
}
