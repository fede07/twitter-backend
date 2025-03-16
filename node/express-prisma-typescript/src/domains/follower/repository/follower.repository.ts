export interface FollowerRepository {
  followUser: (userId: string, followerId: string) => Promise<void>
  unfollowUser: (userId: string, followerId: string) => Promise<void>
  isFollowing: (userId: string, followerId: string) => Promise<boolean>
  getMutualFollowers: (userId: string) => Promise<string[]>
}
