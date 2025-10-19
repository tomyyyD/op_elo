export interface Character {
  id: string
  first_name: string
  elo: number
  image_path: string | null
  wins: number
  losses: number
  recent_change: number
}
