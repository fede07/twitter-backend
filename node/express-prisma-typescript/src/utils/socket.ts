import { Server, Socket } from 'socket.io'
import { Constants, db } from '@utils'
import jwt from 'jsonwebtoken'
import { Server as HttpServer } from 'http'
import { MessageServiceImpl } from '@domains/message/service/message.service.impl'
import { MessageRepositoryImpl } from '@domains/message/repository'
import { FollowerServiceImpl } from '@domains/follower/service/follower.service.impl'
import { FollowerRepositoryImpl } from '@domains/follower/repository/follower.repository.impl'
import { UserRepositoryImpl } from '@domains/user/repository'
import { ChatServiceImpl } from '@domains/chat/service/chat.service.impl'
import ChatRepositoryImpl from '@domains/chat/repository/chat.repository.impl'
import { getUsersFromRoomId } from '@utils/chat'

interface AuthenticatedSocket extends Socket {
  userId?: string
}

const chatService = new ChatServiceImpl(new ChatRepositoryImpl(db))
const messageService = new MessageServiceImpl(new MessageRepositoryImpl(db), new ChatRepositoryImpl(db))
const followerService = new FollowerServiceImpl(new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))
const setupSocket = (httpServer: HttpServer): void => {
  const io = new Server(httpServer, {
    // TODO: add env.variable
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Authorization'],
      credentials: true
    }
  })

  io.use((socket: AuthenticatedSocket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      console.log('MISSING_TOKEN')
      next(new Error('MISSING_TOKEN'))
      return
    }
    try {
      const extractedToken = token.split(' ')[1]
      const payload = jwt.verify(extractedToken, Constants.TOKEN_SECRET) as { userId: string }
      socket.userId = payload.userId
      next()
    } catch {
      next(new Error('INVALID_TOKEN'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    socket.emit('User ', socket.userId, ' connected')

    // TODO: VALIDATIONS

    socket.on('join-chat', async ({ recipientId }: { recipientId: string }) => {
      console.log(`User joined chat with ${recipientId}`)
      if (!socket.userId) return
      const follows = await followerService.areBothFollowingEachOther(recipientId, socket.userId)
      if (follows) {
        const room = [socket.userId, recipientId].sort().join('_')
        void socket.join(room)
        socket.emit('joined-chat', { roomId: room })
        socket.to(room).emit(socket.userId, ' joined-chat', { roomId: room })
      } else {
        socket.emit('error', { message: 'You are not following each other' })
      }
    })

    socket.on('chat-message', async ({ roomId, message }: { message: string, roomId: string }) => {
      if (!roomId) {
        socket.emit('error', { message: 'Room id is missing' })
        return
      }
      if (!message) {
        socket.emit('error', { message: 'Message is missing' })
        return
      }

      if (!socket.userId) {
        socket.emit('error', { message: 'You are not logged in' })
        return
      }

      if (!socket.rooms.has(roomId)) {
        socket.emit('error', { message: 'You are not in this room' })
        return
      }

      const chatId = await chatService.getChatByRoomId(socket.userId, roomId)

      if (!chatId) {
        await chatService.createChat(socket.userId, roomId)
      }

      const [user1, user2] = getUsersFromRoomId(roomId)

      // const user1 = roomId.slice(0, 36)
      // const user2 = roomId.slice(37)

      const bothFollowing = await followerService.areBothFollowingEachOther(user1, user2)

      if (!bothFollowing) {
        socket.emit('error', { message: 'You are not following each other' })
        return
      }

      const senderId = socket.userId
      const recipientId = user1 === socket.userId ? user2 : user1
      console.log(senderId, recipientId)
      if (![senderId, recipientId].includes(socket.userId)) {
        socket.emit('error', { message: 'You cannot send messages to this room' })
        return
      }

      const savedMessage = await messageService.saveMessage({
        text: message,
        userId: senderId,
        recipientId,
        roomId
      })
      io.to(roomId).emit('new-message', savedMessage)
    })

    socket.on('disconnect', () => {
      socket.emit('User ', socket.userId, ' disconnected')
    })
  })

  console.log('Socket setup complete.')
}

export default setupSocket
