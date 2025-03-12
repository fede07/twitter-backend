import { MessageDto, MessageInputDto } from '@domains/message/dto'

export interface MessageService {
  saveMessage: (message: MessageInputDto) => Promise<MessageDto>
  getUserChatRooms: (userId: string) => Promise<string[]>
}
