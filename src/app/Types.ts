export interface Position {
  x: number
  y: number
}

export type Wall = [Position, Position]

export interface GameState {
  W: number
  H: number
  snakes: Snake[]
  apples: Position[]
  walls: Wall[]
}

export interface PlayerInfo {
  id: string
  teamName: string
  snakeColor?: string
  deadImg?: string
  teamLogo?: string
  nextStep(game: GameState): GameMove
}

export interface GameMove {
  move: Direction
  placeWall?: Wall
  reverse?: boolean
}

export type Direction = 'LEFT' | 'RIGHT' | 'DOWN' | 'UP'

export interface Snake {
  id: string
  isAlive: boolean
  body: Position[]
  color: string
  teamName: string
  score: number
  teamLogo?: string
  wallsLeft: number
  livesLeft: number
}


// Types the player class doesn't need

export type Game = GameState[]

export interface GridCell {
  color?: string
  img?: string
}
