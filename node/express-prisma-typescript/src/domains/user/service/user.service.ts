import { OffsetPagination } from '@types'
import { UserDTO, UserViewDTO } from '../dto';

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (userId: any) => Promise<UserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserDTO[]>
  isPrivate: (userId: string) => Promise<boolean>
  generateProfileImageUrl: (userId: string) => Promise<string>
  getUsersByUsername: (username: string, pagination: {limit: number, skip: number}) => Promise<UserViewDTO[]>
}
