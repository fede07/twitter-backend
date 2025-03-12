import { SignupInputDTO } from '@domains/auth/dto'
import { PrismaClient } from '@prisma/client'
import { OffsetPagination } from '@types'
import { ExtendedUserDTO, UserDTO, UserViewDTO } from '../dto'
import { UserRepository } from './user.repository'

export class UserRepositoryImpl implements UserRepository {
  constructor (private readonly db: PrismaClient) {}

  async create (data: SignupInputDTO): Promise<UserDTO> {
    return await this.db.user.create({
      data
    }).then(user => new UserDTO(user))
  }

  async getById (userId: string): Promise<UserViewDTO | null> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      }
    })
    return user ? new UserViewDTO(user) : null
  }

  async delete (userId: any): Promise<void> {
    await this.db.user.delete({
      where: {
        id: userId
      }
    })
  }

  async getRecommendedUsersPaginated (userId: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    const followings = await this.db.follow.findMany({
      where: { followerId: userId },
      select: { followedId: true }
    })
    const followingsIds = followings.map(f => f.followedId)

    const followedByFollowings = await this.db.follow.findMany({
      where: {
        followerId: {
          in: followingsIds
        }
      },
      select: { followedId: true }
    })
    const followedByFollowingsIds = followedByFollowings.map(f => f.followedId)

    const users = await this.db.user.findMany({
      where: {
        id: { in: followedByFollowingsIds, not: userId }
      },
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined,
      orderBy: [
        {
          id: 'asc'
        }
      ]
    })

    return users.map(user => new UserViewDTO(user))
  }

  async getByEmailOrUsername (email?: string, username?: string): Promise<ExtendedUserDTO | null> {
    const user = await this.db.user.findFirst({
      where: {
        OR: [
          {
            email
          },
          {
            username
          }
        ]
      }
    })
    return user ? new ExtendedUserDTO(user) : null
  }

  async getUsersByUsername (username: string, options: OffsetPagination): Promise<UserViewDTO[]> {
    const users = await this.db.user.findMany({
      where: {
        username: {
          contains: username
        }
      },
      take: options.limit ? options.limit : undefined,
      skip: options.skip ? options.skip : undefined
    })
    return users.map(user => new UserViewDTO(user))
  }

  async isPrivate (userId: string): Promise<boolean> {
    const user = await this.db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        isPrivate: true
      }
    })
    return user?.isPrivate ?? false
  }

  async updateProfileImage (userId: string, imageUrl: string): Promise<UserViewDTO> {
    return await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        profilePicture: imageUrl
      }
    })
  }

  async updatePrivacy (userId: string, isPrivate: boolean): Promise<UserViewDTO> {
    const user = await this.db.user.update({
      where: {
        id: userId
      },
      data: {
        isPrivate
      },
      select: {
        id: true,
        username: true,
        name: true,
        profilePicture: true,
        createdAt: true,
        isPrivate: true,
        followers: true,
        following: true,
        posts: true
      }
    })
    return new UserViewDTO(user)
  }
}
