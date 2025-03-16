import { SignupInputDTO } from '@domains/auth/dto'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserFullDTO, UserViewDTO } from '../dto'

export interface UserRepository {
  create: (data: SignupInputDTO) => Promise<UserDTO>
  delete: (userId: string) => Promise<void>
  getRecommendedUsersPaginated: (userId: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  getById: (userId: string) => Promise<UserFullDTO | null>
  getByEmailOrUsername: (email?: string, username?: string) => Promise<ExtendedUserDTO | null>
  getUsersByUsername: (username: string, options: OffsetPagination) => Promise<UserViewDTO[]>
  isPrivate: (userId: string) => Promise<boolean>
  updateProfileImage: (userId: string, data: string) => Promise<UserViewDTO>
  updatePrivacy: (userId: string, isPrivate: boolean) => Promise<UserViewDTO>
}
