import { ChatDto } from '@domains/chat/dto'

export interface ChatService {
  getChat: (userId: string, chatId: string) => Promise<ChatDto | null>
  getChatByRoomId: (userId: string, roomId: string) => Promise<ChatDto | null>
  createChat: (userId: string, roomId: string) => Promise<ChatDto>
  deleteChat: (userId: string, chatId: string) => Promise<void>
  getChats: (userId: string) => Promise<ChatDto[]>
  getChatsUsers: (userId: string) => Promise<string[]>
}
