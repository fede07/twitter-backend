export interface FollowerService {
  followUser: (followedId: string, followerId: string) => Promise<void>
  unfollowUser: (followedId: string, followerId: string) => Promise<void>
  isFollowing: (followedId: string, followerId: string) => Promise<boolean>
  areBothFollowingEachOther: (followedId: string, followerId: string) => Promise<boolean>
  getMutualFollowers: (followedId: string) => Promise<string[]>
}
