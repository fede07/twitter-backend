import { Request, Response, Router } from 'express'
import HttpStatus from 'http-status'
// express-async-errors is a module that handles async errors in express, don't forget import it in your new controllers
import 'express-async-errors'

import { db, BodyValidation } from '@utils'

import { PostRepositoryImpl } from '../repository'
import { PostService, PostServiceImpl } from '../service'
import { CreatePostInputDTO } from '../dto'
import { FollowerRepositoryImpl } from '@domains/follower/repository/follower.repository.impl'
import { UserRepositoryImpl } from '@domains/user/repository'

export const postRouter = Router()

// Use dependency injection
const service: PostService = new PostServiceImpl(new PostRepositoryImpl(db), new FollowerRepositoryImpl(db), new UserRepositoryImpl(db))

/**
 * @swagger
 * /api/posts:
 *   get:
 *     summary: Get latest posts
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         required: false
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *         required: false
 *       - in: query
 *         name: after
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       200:
 *         description: List of latest posts
 */

postRouter.get('/', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { limit, before, after } = req.query as Record<string, string>

  const posts = await service.getLatestPosts(userId, { limit: Number(limit), before, after })

  return res.status(HttpStatus.OK).json(posts)
})

/**
 * @swagger
 * /api/posts/{postId}:
 *   get:
 *     summary: Get post by ID
 *     tags:
 *     - Posts
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Not found
 */

postRouter.get('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  try {
    const post = await service.getPost(userId, postId)
    return res.status(HttpStatus.OK).json(post)
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).send('Not found')
  }
})

/**
 * @swagger
 * /api/posts/by_user/{userId}:
 *   get:
 *     summary: Get posts by user
 *     tags:
 *     - Posts
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts by user
 *       404:
 *         description: Not found
 */

postRouter.get('/by_user/:userId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params

  try {
    const posts = await service.getPostsByAuthor(userId, authorId)
    return res.status(HttpStatus.OK).json(posts)
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).send('Not found')
  }
})

/**
 * @swagger
 * /api/posts/by_user/{userId}/comments:
 *   get:
 *     summary: Get comments by a specific user
 *     tags:
 *     - Posts
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of comments by user
 *       404:
 *         description: Not found
 */

postRouter.get('/by_user/:userId/comments', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { userId: authorId } = req.params

  try {
    const posts = await service.getCommentByAuthorId(userId, authorId)
    return res.status(HttpStatus.OK).json(posts)
  } catch (error) {
    return res.status(HttpStatus.NOT_FOUND).send('Not found')
  }
})

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *     - Posts
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInputDTO'
 *     responses:
 *       201:
 *         description: Post created successfully
 */

postRouter.post('/', BodyValidation(CreatePostInputDTO), async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const data = req.body

  const post = await service.createPost(userId, data)

  return res.status(HttpStatus.CREATED).json(post)
})

/**
 * @swagger
 * /api/posts/{postId}:
 *   post:
 *     summary: Create a comment on a post
 *     tags:
 *     - Posts
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostInputDTO'
 *     responses:
 *       201:
 *         description: Comment created successfully
 */

postRouter.post('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const data = req.body

  const post = await service.createComment(userId, postId, data)

  return res.status(HttpStatus.CREATED).json(post)
})

/**
 * @swagger
 * /api/posts/{postId}:
 *   delete:
 *     summary: Delete a post
 *     tags:
 *     - Posts
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */

postRouter.delete('/:postId', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deletePost(userId, postId)

  return res.status(HttpStatus.OK).send(`Deleted post ${postId}`)
})
