import { ChatDto } from '@domains/chat/dto'

export interface ChatRepository {
  getChatById: (userId: string, chatId: string) => Promise<ChatDto | null>
  getChatByRoomId: (userId: string, roomId: string) => Promise<ChatDto | null>
  getChats: (userId: string) => Promise<ChatDto[]>
  createChat: (userId: string, recipientId: string, roomId: string) => Promise<ChatDto>
  deleteChat: (userId: string, chatId: string) => Promise<void>
  getChatUsers: (userId: string) => Promise<string[]>
}
