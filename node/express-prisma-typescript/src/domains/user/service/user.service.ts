import { OffsetPagination } from '@types'
import { UserViewDTO } from '../dto'

export interface UserService {
  deleteUser: (userId: any) => Promise<void>
  getUser: (userId: any) => Promise<UserViewDTO>
  getUserRecommendations: (userId: any, options: OffsetPagination) => Promise<UserViewDTO[]>
  isPrivate: (userId: string) => Promise<boolean>
  generateProfileImageUrl: (userId: string) => Promise<string>
  getUsersByUsername: (username: string, pagination: { limit: number, skip: number }) => Promise<UserViewDTO[]>
  updateUserPrivacy: (userId: string, isPrivate: boolean) => Promise<UserViewDTO>
}
