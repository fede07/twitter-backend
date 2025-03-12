
export function generateRoomId (user1: string, user2: string): string {
  return [user1, user2].sort().join('_')
}

export function getUsersFromRoomId (roomId: string): string[] {
  const user1 = roomId.slice(0, 36)
  const user2 = roomId.slice(37)

  return [user1, user2]
}
