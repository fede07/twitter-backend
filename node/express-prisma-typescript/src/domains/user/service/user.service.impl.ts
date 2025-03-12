import { NotFoundException, ValidationException } from '@utils/errors'
import { OffsetPagination } from 'types'
import { UserViewDTO } from '../dto'
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { generatePresignedUrl, getPublicUrl } from '@utils/s3-utils'
import { v4 as uuidv4, validate as isUuid } from 'uuid'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: any): Promise<UserViewDTO> {
    if (!isUuid(userId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserViewDTO[]> {
    return await this.repository.getRecommendedUsersPaginated(userId, options)
  }

  async deleteUser (userId: any): Promise<void> {
    if (!isUuid(userId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    if (await this.repository.getById(userId) === null) throw new NotFoundException('user')
    await this.repository.delete(userId)
  }

  async isPrivate (userId: string): Promise<boolean> {
    if (!isUuid(userId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return await this.repository.isPrivate(userId)
  }

  async generateProfileImageUrl (userId: string): Promise<string> {
    const uuid = uuidv4()
    const key = `users/${userId}/profile-image-${uuid}.jpg`

    const uploadUrl = await generatePresignedUrl(key, 'image/jpeg')

    const fileUrl = getPublicUrl(key)
    console.log('PublicURL', fileUrl)

    await this.repository.updateProfileImage(userId, key)

    return uploadUrl
  }

  async getUsersByUsername (username: string, pagination: { limit: number, skip: number }): Promise<UserViewDTO[]> {
    return await this.repository.getUsersByUsername(username, pagination)
  }

  async updateUserPrivacy (userId: string, isPrivate: boolean): Promise<UserViewDTO> {
    if (!isUuid(userId)) throw new ValidationException([{ message: 'INVALID_UUID' }])
    console.log('repository')

    return await this.repository.updatePrivacy(userId, isPrivate)
  }
}
