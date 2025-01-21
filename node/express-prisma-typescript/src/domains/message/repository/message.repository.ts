import { MessageDto, MessageInputDto } from '@domains/message/dto';

export interface MessageRepository {
  saveMessage: (data: MessageInputDto) => Promise<MessageDto>
}
