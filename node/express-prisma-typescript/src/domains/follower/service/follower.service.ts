export interface FollowerService {
  followUser: (followedId: string, followerId: string) => Promise<void>
  unfollowUser: (followedId: string, followerId: string) => Promise<void>
}
