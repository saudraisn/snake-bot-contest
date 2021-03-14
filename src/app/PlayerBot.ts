import { last } from "lodash";
import { isEqual, randomElem } from "./helpers";
import { GameState, GameMove, PlayerInfo, Position } from "./Types";

export class PlayerBot implements PlayerInfo {
  teamLogo?: string = ''
  deadImg?: string;

  constructor(public id = 'p1', public snakeColor = 'aquamarine', public teamName: string = 'Dummy Player') {

  }

  nextStep(game: GameState): GameMove {

    const snake = game.snakes.find(s => s.id === this.id)
    const head = last(snake.body)

    const up = { x: head.x, y: head.y - 1 }
    const down = { x: head.x, y: head.y + 1 }
    const left = { x: head.x - 1, y: head.y }
    const right = { x: head.x + 1, y: head.y }

    let possibleMoves: GameMove[] = []

    if (this.validatePos(up, game)) {
      possibleMoves.push({ move: 'UP' })
    }
    if (this.validatePos(left, game)) {
      possibleMoves.push({ move: 'LEFT' })
    }
    if (this.validatePos(down, game)) {
      possibleMoves.push({ move: 'DOWN' })
    }
    if (this.validatePos(right, game)) {
      possibleMoves.push({ move: 'RIGHT' })
    }
    return randomElem(possibleMoves) || { move: 'RIGHT' }
  }

  validatePos(pos: Position, game: GameState) {

    let valid = true

    if (pos.x < 0 || pos.y < 0 || pos.x >= game.W || pos.y >= game.H) {
      return false
    }

    game.snakes.forEach(s => {
      s.body.forEach(p => {
        if (isEqual(pos, p)) {
          valid = false
        }
      })
    })

    return valid

  }
}
