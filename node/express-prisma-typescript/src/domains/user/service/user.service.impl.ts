import { NotFoundException } from '@utils/errors';
import { OffsetPagination } from 'types'
import { UserDTO, UserViewDTO } from '../dto';
import { UserRepository } from '../repository'
import { UserService } from './user.service'
import { generatePresignedUrl, getPublicUrl } from '@utils/s3-utils'
import { v4 as uuidv4 } from 'uuid'

export class UserServiceImpl implements UserService {
  constructor (private readonly repository: UserRepository) {}

  async getUser (userId: any): Promise<UserViewDTO> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return user
  }

  async getUserRecommendations (userId: any, options: OffsetPagination): Promise<UserDTO[]> {
    // TODO: make this return only users followed by users the original user follows
    return await this.repository.getRecommendedUsersPaginated(options)
  }

  async deleteUser (userId: any): Promise<void> {
    await this.repository.delete(userId)
  }

  async isPrivate (userId: string): Promise<boolean> {
    const user = await this.repository.getById(userId)
    if (!user) throw new NotFoundException('user')
    return await this.repository.isPrivate(userId)
  }

  async generateProfileImageUrl (userId: string): Promise<string> {
    const uuid = uuidv4();
    const key = `users/${userId}/${uuid}.jpg`;

    const uploadUrl = await generatePresignedUrl(key, 'image/jpeg');

    const fileUrl = getPublicUrl(key);

    await this.repository.updateProfileImage(userId, fileUrl);

    return uploadUrl;
  }
}
