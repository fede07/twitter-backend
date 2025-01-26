import { IsString, IsNotEmpty, MaxLength, IsUUID } from 'class-validator'

export class MessageInputDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(240)
    text!: string

  @IsString()
  @IsNotEmpty()
  @IsUUID()
    userId!: string

  @IsString()
  @IsNotEmpty()
  @IsUUID()
    recipientId!: string

  @IsString()
  @IsNotEmpty()
  @IsUUID()
    roomId!: string
}

export class MessageDto {
  constructor (message: MessageDto) {
    this.id = message.id
    this.text = message.text
    this.senderId = message.senderId
    this.recipientId = message.recipientId
    this.roomId = message.roomId
    this.createdAt = message.createdAt
  }

  id: string
  text: string
  senderId: string
  recipientId: string
  roomId: string
  createdAt: Date
}
