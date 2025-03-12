
export class ChatDto {
  constructor (chat: ChatDto) {
    this.id = chat.id
    this.roomId = chat.roomId
    this.participants = chat.participants
    this.createdAt = chat.createdAt
    this.updatedAt = chat.updatedAt
  }

  id: string
  roomId: string
  participants: string []
  createdAt: Date
  updatedAt: Date
}
