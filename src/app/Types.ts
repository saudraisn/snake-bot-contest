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
  placeWall?: Wall // The position where you want to place the next wall, make sure you have some left!
  reverse?: boolean // If you want to reverse your snake's body before applying your next move command
  placeBanana?: Position // The position where you want to place the next banana, make sure you have some left!
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
  wallsLeft: number // the amount of walls the player can place on the board
  livesLeft: number // amount of lives left, when the snake hits 0, the player will die
  bananasLeft: number // the amount of bananas you have left to place on the board
  slideTurnsLeft: number // a banana makes you loose control for slideTurnsLeft game turns
}


// Types the player class doesn't need

export type Game = GameState[]

export interface GridCell {
  color?: string
  img?: string
}
