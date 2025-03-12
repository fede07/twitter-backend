import { ExtendedPostDTO, PostDTO } from '@domains/post/dto'
import { UserViewDTO } from '@domains/user/dto'
import { db } from '@utils/database'

export async function mapPostToExtendedPostDTO (post: PostDTO): Promise<ExtendedPostDTO> {
  const user = await db.user.findUnique({
    where: {
      id: post.authorId
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

  if (user === null) {
    throw new Error('User not found')
  }

  const author = new UserViewDTO(user)

  const qtyLikes = await db.reaction.count({
    where: {
      postId: post.id,
      type: 'LIKE'
    }
  })
  const qtyRetweets = await db.reaction.count({
    where: {
      postId: post.id,
      type: 'RETWEET'
    }
  })
  const qtyComments = await db.post.count({
    where: {
      parentId: post.id,
      deletedAt: null
    }
  })

  return new ExtendedPostDTO({
    ...post,
    author,
    qtyLikes,
    qtyRetweets,
    qtyComments
  })
}
