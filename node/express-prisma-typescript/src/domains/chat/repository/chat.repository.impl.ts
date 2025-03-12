import { ChatRepository } from '@domains/chat/repository/chat.repository'
import { PrismaClient } from '@prisma/client'
import { ChatDto } from '@domains/chat/dto'

export class ChatRepositoryImpl implements ChatRepository {
  constructor (private readonly db: PrismaClient) {}

  async createChat (userId: string, recipientId: string, roomId: string): Promise<ChatDto> {
    const chat = await this.db.chat.create({
      data: {
        roomId,
        participants: {
          connect: [{ id: userId }, { id: recipientId }]
        },
        createdAt: new Date()
      }
    })
    return new ChatDto({
      ...chat,
      participants: [userId, recipientId]
    })
  }

  async deleteChat (userId: string, chatRoomId: string): Promise<void> {
    await this.db.chat.update({
      where: {
        id: chatRoomId,
        participants: {
          some: {
            id: userId
          }
        }
      },
      data: {
        deletedAt: new Date()
      }
    })
  }

  async getChatById (userId: string, chatId: string): Promise<ChatDto | null> {
    const chat = await this.db.chat.findUnique({
      where: {
        id: chatId,
        participants: {
          some: {
            id: userId
          }
        }
      },
      include: {
        participants: true
      }
    })

    if (!chat) {
      return null
    }

    return new ChatDto({
      ...chat,
      id: chat.id ?? '', // Ensure 'id' is non-undefined
      participants: chat.participants.map((participant) => participant.id)
    })
  }

  async getChatByRoomId (userId: string, roomId: string): Promise<ChatDto | null> {
    const chat = await this.db.chat.findUnique({
      where: {
        roomId,
        participants: {
          some: {
            id: userId
          }
        }
      },
      include: {
        participants: true
      }
    })

    if (!chat) {
      return null
    }

    return new ChatDto({
      ...chat,
      participants: chat.participants.map((participant) => participant.id)
    })
  }

  async getChats (userId: string): Promise<ChatDto[]> {
    const chats = await this.db.chat.findMany({
      where: {
        participants: {
          some: {
            id: userId
          }
        }
      },
      include: {
        participants: true
      }
    })

    return chats.map(
      (chat) =>
        new ChatDto({
          ...chat,
          participants: chat.participants.map((participant) => participant.id)
        })
    )
  }

  async getChatUsers (userId: string): Promise<string[]> {
    const chats = await this.db.chat.findMany({
      where: {
        participants: {
          some: {
            id: userId
          }
        }
      },
      include: {
        participants: {
          select: { id: true }
        }
      }
    })

    return chats.flatMap((chat) => chat.participants.map((participant) => participant.id).filter((id) => id !== userId))
  }
}

export default ChatRepositoryImpl
