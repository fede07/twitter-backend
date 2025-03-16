import { MessageDto, MessageInputDto } from '@domains/message/dto'
import { CursorPagination } from '@types'

export interface MessageService {
  saveMessage: (message: MessageInputDto) => Promise<MessageDto>
  getUserChatRooms: (userId: string) => Promise<string[]>
  getChatMessages: (chatId: string, options: CursorPagination) => Promise<MessageDto[]>
}
