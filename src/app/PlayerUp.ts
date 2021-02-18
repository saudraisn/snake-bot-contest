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
  id:string
  teamName: string
  snakeColor: string
  deadImg: string
  teamLogo: string
}

export interface GameMove {
  move: Direction
}

export type Direction = 'LEFT' | 'RIGHT' | 'DOWN' | 'UP'

export interface Snake {
  id:string
  isAlive: boolean
  body: Position[]
  color: string
}

class Player implements PlayerInfo {
  id:string // this will be set by the game to assign a snake to each of the players

  teamName = 'Player up' // Set your team name here
  snakeColor = 'gold' // Set your snake color here, must be a valid css color name or hexa color code. ex : #FAFAFA
  deadImg = '' // An image url to display when your snake is dead
  teamLogo = '' // An image url for displaying your team logo

  nextStep(game: GameState): GameMove {
    const mySnake = game.snakes.find(snake => snake.id === this.id) // retrieve the player's own snake

    // TODO: Implement logic to determine the snake's next move
    // this function is called once per game iteration (every time the snake moves) 

    return {move : 'UP'}
  }
}

new Player() // Used for the game to retrieve the player object instance, leave this here please.
