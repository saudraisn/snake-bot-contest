export interface Position {
  x: number
  y: number
}

export interface GameState {
  W:number
  H:number
  snakes: Snake[]
  apples: Position[]
}

export interface PlayerInfo {
  teamName: string
  snakeColor?: string
  deadImg?: string
  teamLogo?: string
}

export interface GameMove {
  move: Direction
}

export type Direction = 'LEFT' | 'RIGHT' | 'DOWN' | 'UP'

export interface GridCell {
  color?: string
  img?: string
}

export interface Snake {
  id:string
  isAlive: boolean
  body: Position[]
  color: string
}

type Game = GameState[]
