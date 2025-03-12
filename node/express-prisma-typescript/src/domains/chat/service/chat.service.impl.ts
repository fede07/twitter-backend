import { ChatService } from '@domains/chat/service/chat.service'
import { ChatRepository } from '@domains/chat/repository/chat.repository'
import { ChatDto } from '@domains/chat/dto'
import { getUsersFromRoomId } from '@utils/chat'

export class ChatServiceImpl implements ChatService {
  constructor (private readonly repository: ChatRepository) {}

  async createChat (userId: string, roomId: string): Promise<ChatDto> {
    const [user1, user2] = getUsersFromRoomId(roomId)

    const chat = await this.repository.createChat(user1, user2, roomId)

    return new ChatDto(chat)
  }

  async deleteChat (userId: string, chatId: string): Promise<void> {
    await this.repository.deleteChat(userId, chatId)
  }

  async getChat (userId: string, chatId: string): Promise<ChatDto | null> {
    const chat = await this.repository.getChatById(userId, chatId)
    return chat ? new ChatDto(chat) : null
  }

  async getChatByRoomId (userId: string, roomId: string): Promise<ChatDto | null> {
    const chat = await this.repository.getChatByRoomId(userId, roomId)
    return chat ? new ChatDto(chat) : null
  }

  async getChats (userId: string): Promise<ChatDto[]> {
    return await this.repository.getChats(userId)
  }

  async getChatsUsers (userId: string): Promise<string[]> {
    return await this.repository.getChatUsers(userId)
  }
}
