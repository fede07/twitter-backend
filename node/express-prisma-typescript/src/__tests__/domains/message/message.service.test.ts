import { MessageServiceImpl } from '@domains/message/service/message.service.impl'
import { MessageRepository } from '@domains/message/repository'

describe('MessageService', () => {
  let messageService: MessageServiceImpl
  let messageRepository: jest.Mocked<MessageRepository>

  beforeEach(() => {
    messageRepository = {
      saveMessage: jest.fn()
    } as unknown as jest.Mocked<MessageRepository>

    messageService = new MessageServiceImpl(messageRepository)
  })

  it('should send a message', async () => {
    const message = {
      text: 'mockContent',
      userId: 'mockSenderId',
      recipientId: 'mockReceiverId',
      roomId: 'mockRoomId'
    }

    const savedMessage = {
      ...message,
      id: 'mockMessageId',
      senderId: 'mockSenderId',
      roomId: 'mockRoomId',
      createdAt: new Date()
    }

    messageRepository.saveMessage.mockResolvedValue(savedMessage)
    const result = await messageService.saveMessage(message)
    expect(result).toEqual(savedMessage)
  })
})
