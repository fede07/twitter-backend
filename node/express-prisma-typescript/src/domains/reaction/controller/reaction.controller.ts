import { Request, Response, Router } from 'express'

import { db } from '@utils'

import 'express-async-errors'
import HttpStatus from 'http-status'
import { ReactionService, ReactionServiceImpl } from '@domains/reaction/service'
import { ReactionRepositoryImpl } from '@domains/reaction/repository/reaction.repository.impl'
import { UserRepositoryImpl } from '@domains/user/repository'
import { PostRepositoryImpl } from '@domains/post/repository'

export const reactionRouter = Router()

const service: ReactionService = new ReactionServiceImpl(
  new ReactionRepositoryImpl(db),
  new UserRepositoryImpl(db),
  new PostRepositoryImpl(db)
)

/**
 * @swagger
 * /api/reactions/{post_id}:
 *   post:
 *     summary: Creates a reaction for a specific post
 *     description: Allows a user to react to a post with a specified reaction type.
 *     tags:
 *       - Reactions
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         description: The ID of the post to react to
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: The type of reaction (e.g., LIKE, LOVE, etc.)
 *     responses:
 *       201:
 *         description: Reaction successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 postId:
 *                   type: string
 *                   description: The ID of the post the reaction was added to
 *       400:
 *         description: Invalid input or missing required fields
 *       404:
 *         description: Post or user not found
 *       500:
 *         description: Server error
 */

reactionRouter.post('/:post_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params
  const { type } = req.body

  await service.createReaction(postId, userId, type)
  return res.status(HttpStatus.CREATED).json({
    postId
  })
})

/**
 * @swagger
 * /api/reactions/{post_id}:
 *   delete:
 *     summary: Deletes a reaction for a specific post
 *     description: Allows a user to remove their reaction from a post.
 *     tags:
 *       - Reactions
 *     parameters:
 *       - in: path
 *         name: post_id
 *         required: true
 *         description: The ID of the post whose reaction should be deleted
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Reaction successfully deleted
 *       404:
 *         description: Reaction not found
 *       500:
 *         description: Server error
 */

reactionRouter.delete('/:post_id', async (req: Request, res: Response) => {
  const { userId } = res.locals.context
  const { postId } = req.params

  await service.deleteReaction(postId, userId)
  return res.status(HttpStatus.NO_CONTENT).send()
})
