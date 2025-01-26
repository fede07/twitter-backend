import { PostServiceImpl } from '@domains/post/service'
import { PostRepository } from '@domains/post/repository'
import { FollowerRepository } from '@domains/follower/repository/follower.repository'
import { UserRepository } from '@domains/user/repository'
import { validate } from 'class-validator'
import { generatePresignedUrl } from '@utils/s3-utils'
import * as uuidUtils from 'uuid'

jest.mock('class-validator', () => ({
  validate: jest.fn()
}))

jest.mock('@utils/s3-utils', () => ({
  generatePresignedUrl: jest.fn(),
  getPublicUrl: jest.fn()
}))

describe('PostService', () => {
  let postService: PostServiceImpl
  let postRepository: jest.Mocked<PostRepository>
  let followerRepository: jest.Mocked<FollowerRepository>
  let userRepository: jest.Mocked<UserRepository>

  beforeEach(() => {
    postRepository = {
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getAllByDatePaginated: jest.fn(),
      getByAuthorId: jest.fn(),
      getCommentByAuthorId: jest.fn(),
      getCommentsByPostId: jest.fn(),
      getAuthorId: jest.fn()
    } as unknown as jest.Mocked<PostRepository>

    followerRepository = {
      followUser: jest.fn(),
      unfollowUser: jest.fn(),
      isFollowing: jest.fn()
    } as unknown as jest.Mocked<FollowerRepository>

    userRepository = {
      getByEmailOrUsername: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      isPrivate: jest.fn()
    } as unknown as jest.Mocked<UserRepository>

    postService = new PostServiceImpl(postRepository, followerRepository, userRepository)
  })

  describe('createPost', () => {
    it('should create a new post', async () => {
      const userId = 'mockUserId'
      const postData = {
        title: 'mockTitle',
        content: 'mockContent',
        images: []
      }
      const post = {
        id: 'mockPostId',
        ...postData,
        userId,
        authorId: userId,
        createdAt: new Date(),
        author: { id: userId, name: 'mockAuthorName' },
        qtyComments: 0,
        qtyLikes: 0,
        qtyRetweets: 0
      }

      const presignedUrls: never[] = []

      const createdPost = {
        post: {
          ...post,
          author: { id: userId, name: 'mockAuthorName' },
          qtyComments: 0,
          qtyLikes: 0,
          qtyRetweets: 0
        },
        presignedUrls
      }
      postRepository.create.mockResolvedValue(post)
      const createdPostDTO = await postService.createPost(userId, postData)
      expect(createdPostDTO).toEqual(createdPost)
    })

    it('should create a new post with presignedUrls', async () => {
      const userId = 'mockUserId'
      const postData = {
        title: 'mockTitle',
        content: 'mockContent',
        images: ['mockImage1.png']
      }
      const createdPost = {
        id: 'mockPostId',
        ...postData,
        userId,
        authorId: userId,
        createdAt: new Date()
      }

      const presignedUrls = [
        {
          fileName: 'mockImage1.png',
          url: 'mockPresignedUrl'
        }
      ]

      const createPostPresignedUrls = {
        post: createdPost,
        presignedUrls
      }

      jest.spyOn({ generatePresignedUrl }, 'generatePresignedUrl').mockResolvedValue('mockPresignedUrl')
      postRepository.create.mockResolvedValue(createdPost)
      const createdPostDTO = await postService.createPost(userId, postData)
      expect(createdPostDTO).toEqual(createPostPresignedUrls)
    })

    it('should get latest posts', async () => {
      const userId = 'mockUserId'
      const postData = {
        title: 'mockTitle',
        content: 'mockContent',
        images: []
      }
      const post = {
        id: 'mockPostId',
        ...postData,
        userId,
        authorId: userId,
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'mockAuthorName',
          username: 'mockUsername',
          profileImage: 'mockProfileImage'
        },
        qtyComments: 0,
        qtyLikes: 0,
        qtyRetweets: 0
      }

      postRepository.getAllByDatePaginated.mockResolvedValue([post])
      const result = await postService.getLatestPosts('mockUserId', { limit: 10 })
      expect(result).toEqual([post])
    })

    it('should get posts by author', async () => {
      const userId = 'mockUserId'
      const targetUserId = 'mockTargetUserId'
      const postData = {
        title: 'mockTitle',
        content: 'mockContent',
        images: []
      }
      const post = {
        id: 'mockPostId',
        ...postData,
        userId,
        authorId: userId,
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'mockAuthorName',
          username: 'mockUsername',
          profileImage: 'mockProfileImage'
        },
        qtyComments: 0,
        qtyLikes: 0,
        qtyRetweets: 0
      }

      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)
      userRepository.isPrivate.mockResolvedValue(true)
      followerRepository.isFollowing.mockResolvedValue(true)
      postRepository.getByAuthorId.mockResolvedValue([post])

      const result = await postService.getPostsByAuthor(userId, targetUserId)
      expect(result).toEqual([post])
    })

    it('should throw error if target user is private and user is not following target user', async () => {
      const userId = 'mockUserId'
      const targetUserId = 'mockTargetUserId'
      const postData = {
        title: 'mockTitle',
        content: 'mockContent',
        images: []
      }
      const post = {
        id: 'mockPostId',
        ...postData,
        userId,
        authorId: userId,
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'mockAuthorName',
          username: 'mockUsername',
          profileImage: 'mockProfileImage'
        },
        qtyComments: 0,
        qtyLikes: 0,
        qtyRetweets: 0
      }

      userRepository.isPrivate.mockResolvedValue(true)
      followerRepository.isFollowing.mockResolvedValue(false)
      postRepository.getByAuthorId.mockResolvedValue([post])

      await expect(postService.getPostsByAuthor(userId, targetUserId)).rejects.toThrow(Error)
    })

    it('should trow validation error if post data is invalid', async () => {
      const userId = 'mockUserId'
      const postData = {
        title: 'mockTitle',
        content: 'mockContent',
        images: []
      }
      jest.spyOn({ validate }, 'validate').mockRejectedValue(new Error('validation error'))
      await expect(postService.createPost(userId, postData)).rejects.toThrow(Error)
    })
  })

  describe('createComment', () => {
    it('should create a new comment', async () => {
      const userId = 'mockUserId'
      const postId = 'mockPostId'

      const commentData = {
        content: 'mockComment'
      }
      const createdComment = {
        id: 'mockCommentId',
        ...commentData,
        userId,
        postId,
        authorId: userId,
        images: [],
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'mockAuthorName',
          username: 'mockUsername',
          profileImage: 'mockProfileImage'
        },
        qtyComments: 0,
        qtyLikes: 0,
        qtyRetweets: 0
      }

      const presignedUrls: never[] = []

      const createdPostPresignedUrls = {
        post: createdComment,
        presignedUrls
      }

      jest.spyOn({ validate }, 'validate').mockResolvedValue([])
      postRepository.create.mockResolvedValue(createdComment)
      const result = await postService.createPost(userId, commentData, postId)
      expect(result).toEqual(createdPostPresignedUrls)
    })

    it('should get comments by post id', async () => {
      const userId = 'mockUserId'
      const postId = 'mockPostId'

      const commentData = {
        content: 'mockComment'
      }
      const createdComment = {
        id: 'mockCommentId',
        ...commentData,
        userId,
        postId,
        authorId: userId,
        images: [],
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'mockAuthorName',
          username: 'mockUsername',
          profileImage: 'mockProfileImage'
        },
        qtyComments: 0,
        qtyLikes: 0,
        qtyRetweets: 0
      }

      postRepository.getCommentsByPostId.mockResolvedValue([createdComment])
      const result = postService.getCommentsByPostId(postId, { limit: 10 })
      await expect(result).resolves.toEqual([createdComment])
    })

    it('should get comments by author id', async () => {
      const userId = 'mockUserId'
      const targetUserId = 'mockTargetUserId'
      const commentData = {
        content: 'mockComment'
      }
      const createdComment = {
        id: 'mockCommentId',
        ...commentData,
        userId,
        postId: 'mockPostId',
        authorId: userId,
        images: [],
        createdAt: new Date(),
        author: {
          id: userId,
          name: 'mockAuthorName',
          username: 'mockUsername',
          profileImage: 'mockProfileImage'
        },
        qtyComments: 0,
        qtyLikes: 0,
        qtyRetweets: 0
      }

      jest.spyOn(uuidUtils, 'validate').mockReturnValue(true)
      userRepository.isPrivate.mockResolvedValue(true)
      followerRepository.isFollowing.mockResolvedValue(true)
      postRepository.getCommentByAuthorId.mockResolvedValue([createdComment])
      const result = postService.getCommentByAuthorId(userId, targetUserId)
      await expect(result).resolves.toEqual([createdComment])
    })

    it('should throw error if target user is private and user is not following target user', async () => {
      const userId = 'mockUserId'
      const targetUserId = 'mockTargetUserId'

      userRepository.isPrivate.mockResolvedValue(true)
      followerRepository.isFollowing.mockResolvedValue(false)

      await expect(postService.getCommentByAuthorId(userId, targetUserId)).rejects.toThrow(Error)
    })
  })

  describe('deletePost', () => {
    it('should delete post if user is the author', async () => {
      const userId = 'mockUserId'
      const postId = 'mockPostId'

      const mockPost = {
        id: postId,
        authorId: userId,
        content: 'mockContent',
        images: [],
        createdAt: new Date()
      }

      postRepository.getById.mockResolvedValue(mockPost)

      await postService.deletePost(userId, postId)
      expect(postRepository.delete).toHaveBeenCalledWith(postId)
    })

    it('should throw error if post does not exist', async () => {
      const userId = 'mockUserId'
      const postId = 'mockPostId'

      postRepository.getById.mockResolvedValue(null)
      await expect(postService.deletePost(userId, postId)).rejects.toThrow(Error)
    })

    it('should throw error if user is not the author', async () => {
      const userId = 'mockUserId'
      const postId = 'mockPostId'

      const mockPost = {
        id: postId,
        authorId: 'mockAuthorId',
        content: 'mockContent',
        images: [],
        createdAt: new Date()
      }

      postRepository.getById.mockResolvedValue(mockPost)
      await expect(postService.deletePost(userId, postId)).rejects.toThrow(Error)
    })
  })

  describe('getPost', () => {
    it('should return post if it exist and user is the author', async () => {
      const userId = 'mockUserId'
      const postId = 'mockPostId'
      const mockPost = {
        id: postId,
        authorId: userId,
        content: 'mockContent',
        images: [],
        createdAt: new Date()
      }

      postRepository.getById.mockResolvedValue(mockPost)
      const post = await postService.getPost(userId, postId)
      expect(post).toEqual(mockPost)
    })

    it('should throw error if post does not exist', async () => {
      const userId = 'mockUserId'
      const postId = 'mockPostId'
      const mockPost = null

      postRepository.getById.mockResolvedValue(mockPost)
      await expect(postService.getPost(userId, postId)).rejects.toThrow(Error)
    })

    it('should throw error if user cannot view post', async () => {
      const userId = 'mockUserId'
      const postId = 'mockPostId'

      const mockPost = {
        id: postId,
        authorId: 'mockAuthorId',
        content: 'mockContent',
        images: [],
        createdAt: new Date()
      }

      postRepository.getById.mockResolvedValue(mockPost)
      jest.spyOn(postService, 'canViewPost').mockResolvedValue(false)
      await expect(postService.getPost(userId, postId)).rejects.toThrow(Error)
    })
  })

  describe('get author id', () => {
    it('should return author id', async () => {
      const postId = 'mockPostId'
      const authorId = 'mockAuthorId'

      postRepository.getAuthorId.mockResolvedValue(authorId)
      const result = await postService.getAuthorId(postId)
      expect(result).toEqual(authorId)
    })
  })

  describe('canViewPost', () => {
    it('should return true if user is following target user', async () => {
      const userId = 'mockUserId'
      const targetUserId = 'mockTargetUserId'

      userRepository.isPrivate.mockResolvedValue(true)
      followerRepository.isFollowing.mockResolvedValue(true)
      const result = await postService.canViewPost(userId, targetUserId)
      expect(result).toEqual(true)
    })

    it('should return false if user is not following target user', async () => {
      const userId = 'mockUserId'
      const targetUserId = 'mockTargetUserId'

      userRepository.isPrivate.mockResolvedValue(true)
      followerRepository.isFollowing.mockResolvedValue(false)
      const result = await postService.canViewPost(userId, targetUserId)
      expect(result).toEqual(false)
    })
  })
})
