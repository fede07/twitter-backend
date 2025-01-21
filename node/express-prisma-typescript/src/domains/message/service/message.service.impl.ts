import { MessageService } from '@domains/message/service/message.service';
import { MessageDto, MessageInputDto } from '@domains/message/dto';
import { MessageRepository } from '@domains/message/repository';

export class MessageServiceImpl implements MessageService {
  constructor (
    private readonly repository: MessageRepository
  ) {}

  saveMessage (message: MessageInputDto): Promise<MessageDto> {
    return this.repository.saveMessage(message)
  }

}
