import { AuthServiceImpl } from '@domains/auth/service'
import { UserRepository } from '@domains/user/repository'
import * as Utils from '@utils'
import { ConflictException, NotFoundException, ValidationException } from '@utils'

jest.mock('@utils', () => ({
  encryptPassword: jest.fn(),
  generateAccessToken: jest.fn(),
  checkPassword: jest.fn(),
}))

describe('AuthServiceImpl', () => {
  let authService: AuthServiceImpl
  let userRepository: jest.Mocked<UserRepository>

  beforeEach(() => {
    userRepository = {
      getByEmailOrUsername: jest.fn(),
      getUserById: jest.fn(),
      create: jest.fn()
    } as unknown as jest.Mocked<UserRepository>

    authService = new AuthServiceImpl(userRepository)

  })

  describe('signup', () => {
    it('should create a new user', async () => {
      const signupData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }
      const encryptedPassword = 'encryptedPassword123'
      const createdUser = {
        id: 'new-user-id',
        ...signupData,
        password: encryptedPassword,
        username: 'testuser',
        name: null,
        createdAt: new Date(),
      }
      const token = 'validAccessToken'

      userRepository.getByEmailOrUsername.mockResolvedValue(null)
      jest.spyOn(Utils, 'encryptPassword').mockResolvedValue(encryptedPassword)
      userRepository.create.mockResolvedValue(createdUser)
      jest.spyOn(Utils, 'generateAccessToken').mockReturnValue(token)

      const result = await authService.signup(signupData)
      expect(result).toEqual({ token })
    })

    it('should throw a ConflictException if the email or username already exists', async () => {
      const signupData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      }
      const encryptedPassword = 'encryptedPassword123'

      const existingUser = {
        id: 'existing-user-id',
        ...signupData,
        password: encryptedPassword,
        name: null,
        createdAt: new Date(),
      }
      userRepository.getByEmailOrUsername.mockResolvedValue(existingUser)
      await expect(authService.signup(signupData)).rejects.toThrow(ConflictException)
    })

    it('should throw a ValidationError if the password is too short', async () => {
      const signupData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'pass',
      }
      userRepository.getByEmailOrUsername.mockResolvedValue(null)
      await expect(authService.signup(signupData)).rejects.toThrow(ValidationException)
    })

  })

  describe('login', () => {
    it('should return a valid token', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      }
      const encryptedPassword = 'encryptedPassword123'
      const user = {
        id: 'user-id',
        ...loginData,
        username: 'tester',
        password: encryptedPassword,
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      const token = 'validAccessToken'

      userRepository.getByEmailOrUsername.mockResolvedValue(user)
      jest.spyOn(Utils, 'checkPassword').mockResolvedValue(true)
      jest.spyOn(Utils, 'generateAccessToken').mockReturnValue(token)

      const result = await authService.login(loginData)
      expect(result).toEqual({ token })

    })

    it('should throw a ConflictException if the password is incorrect', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      }
      const encryptedPassword = 'encryptedPassword123'
      const user = {
        id: 'user-id',
        ...loginData,
        username: 'tester',
        password: encryptedPassword,
        name: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      userRepository.getByEmailOrUsername.mockResolvedValue(user)
      jest.spyOn(Utils, 'checkPassword').mockResolvedValue(false)

      await expect(authService.login(loginData)).rejects.toThrow(ConflictException)
    })

    it('should throw a NotFoundException if the user does not exist', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      }

      userRepository.getByEmailOrUsername.mockResolvedValue(null)
      await expect(authService.login(loginData)).rejects.toThrow(NotFoundException)
    })
  })


})
